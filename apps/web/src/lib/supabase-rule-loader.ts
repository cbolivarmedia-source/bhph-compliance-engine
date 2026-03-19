import { createServiceClient } from './supabase';
import type { Rule, RuleLoader } from '@bhph/rules-engine';

export class SupabaseRuleLoader implements RuleLoader {
  async loadRules(stateCode: string, domainSlug: string, asOfDate: Date): Promise<Rule[]> {
    const supabase = createServiceClient();

    // Get jurisdiction
    const { data: jurisdiction } = await supabase
      .from('jurisdictions')
      .select('id')
      .eq('state_code', stateCode)
      .single();

    if (!jurisdiction) return [];

    // Get domain
    const { data: domain } = await supabase
      .from('regulatory_domains')
      .select('id')
      .eq('slug', domainSlug)
      .single();

    if (!domain) return [];

    // Get rules with statute references
    const dateStr = asOfDate.toISOString().split('T')[0];
    const { data: rules } = await supabase
      .from('rules')
      .select(`
        *,
        rule_statute_links(
          statute_references(*)
        )
      `)
      .eq('jurisdiction_id', jurisdiction.id)
      .eq('domain_id', domain.id)
      .eq('is_active', true)
      .lte('valid_from', dateStr)
      .or(`valid_until.is.null,valid_until.gte.${dateStr}`);

    if (!rules) return [];

    // Transform to Rule type
    return rules.map(r => ({
      id: r.id,
      jurisdictionId: r.jurisdiction_id,
      stateCode,
      domainSlug,
      ruleParameter: r.rule_parameter,
      comparisonOp: r.comparison_op,
      thresholdValue: r.threshold_value ? Number(r.threshold_value) : null,
      thresholdMin: r.threshold_min ? Number(r.threshold_min) : null,
      thresholdMax: r.threshold_max ? Number(r.threshold_max) : null,
      conditionField: r.condition_field,
      conditionOp: r.condition_op,
      conditionValue: r.condition_value ? Number(r.condition_value) : null,
      conditionMin: r.condition_min ? Number(r.condition_min) : null,
      conditionMax: r.condition_max ? Number(r.condition_max) : null,
      validFrom: r.valid_from,
      validUntil: r.valid_until,
      displayDescription: r.display_description,
      severity: r.severity as 'violation' | 'warning',
      statuteReferences: (r.rule_statute_links || []).map((link: { statute_references: { id: string; title: string; section: string; url: string | null; excerpt: string | null } }) => ({
        id: link.statute_references.id,
        title: link.statute_references.title,
        section: link.statute_references.section,
        url: link.statute_references.url,
        excerpt: link.statute_references.excerpt,
      })),
    }));
  }
}

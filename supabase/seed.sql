-- =============================================================
-- BHPH Compliance Engine — Seed Data
-- =============================================================
-- Idempotent: all inserts use ON CONFLICT DO NOTHING with
-- hardcoded deterministic UUIDs so re-running is safe.
--
-- Jurisdiction UUID prefix:   11111111-1111-1111-1111-0000000000xx
-- Domain UUID prefix:         22222222-2222-2222-2222-0000000000xx
-- Statute ref UUID prefix:    33333333-3333-3333-3333-0000000000xx
-- Rule UUID prefix:           44444444-4444-4444-4444-0000000000xx
-- Rule–statute link prefix:   55555555-5555-5555-5555-0000000000xx
-- =============================================================

-- -------------------------------------------------------------
-- 1. Jurisdictions
--    Illinois (IL) first — home market
-- -------------------------------------------------------------
INSERT INTO jurisdictions (id, state_code, state_name, is_active)
VALUES
  -- IL
  ('11111111-1111-1111-1111-000000000001', 'IL', 'Illinois',       true),
  -- TX
  ('11111111-1111-1111-1111-000000000002', 'TX', 'Texas',          true),
  -- FL
  ('11111111-1111-1111-1111-000000000003', 'FL', 'Florida',        true),
  -- GA
  ('11111111-1111-1111-1111-000000000004', 'GA', 'Georgia',        true),
  -- OH
  ('11111111-1111-1111-1111-000000000005', 'OH', 'Ohio',           true),
  -- NC
  ('11111111-1111-1111-1111-000000000006', 'NC', 'North Carolina', true),
  -- IN
  ('11111111-1111-1111-1111-000000000007', 'IN', 'Indiana',        true),
  -- TN
  ('11111111-1111-1111-1111-000000000008', 'TN', 'Tennessee',      true),
  -- AL
  ('11111111-1111-1111-1111-000000000009', 'AL', 'Alabama',        true),
  -- AZ
  ('11111111-1111-1111-1111-000000000010', 'AZ', 'Arizona',        true),
  -- VA
  ('11111111-1111-1111-1111-000000000011', 'VA', 'Virginia',       true)
ON CONFLICT (state_code) DO NOTHING;

-- -------------------------------------------------------------
-- 2. Regulatory Domains
-- -------------------------------------------------------------
INSERT INTO regulatory_domains (id, slug, display_name, description, is_active)
VALUES
  (
    '22222222-2222-2222-2222-000000000001',
    'usury',
    'Usury / Interest Rate Limits',
    'Maximum allowable APR and finance charge rates for consumer installment sales, '
    'including BHPH auto financing. Rules in this domain enforce state-level caps on '
    'the Annual Percentage Rate charged to buyers.',
    true
  )
ON CONFLICT (slug) DO NOTHING;

-- -------------------------------------------------------------
-- 3. Statute References
--    One primary citation per state for the usury / max-APR rule
-- -------------------------------------------------------------
INSERT INTO statute_references (id, jurisdiction_id, title, section, url, excerpt, retrieved_at)
VALUES

  -- IL: Predatory Loan Prevention Act (PLPA)
  --     815 ILCS 123/ — effective 2021-03-23, caps APR at 36%
  (
    '33333333-3333-3333-3333-000000000001',
    '11111111-1111-1111-1111-000000000001',
    'Illinois Predatory Loan Prevention Act (PLPA)',
    '815 ILCS 123/15',
    'https://www.ilga.gov/legislation/ilcs/ilcs3.asp?ActID=3931&ChapterID=14',
    'No lender may make a consumer loan in which the Annual Percentage Rate exceeds '
    '36% per year. This Act applies to all consumer loans, including retail installment '
    'sales contracts for motor vehicles.',
    '2024-01-01 00:00:00+00'
  ),

  -- TX: Texas Finance Code Chapter 348 — Motor Vehicle Installment Sales
  (
    '33333333-3333-3333-3333-000000000002',
    '11111111-1111-1111-1111-000000000002',
    'Texas Finance Code — Motor Vehicle Installment Sales',
    'Tex. Fin. Code § 348.108',
    'https://statutes.capitol.texas.gov/Docs/FI/htm/FI.348.htm',
    'The maximum time price differential for a retail installment contract secured by '
    'a motor vehicle depends on the vehicle model year. For vehicles more than two model '
    'years old, the maximum add-on rate corresponds to an APR ceiling of approximately 27%.',
    '2024-01-01 00:00:00+00'
  ),

  -- FL: Florida Motor Vehicle Retail Sales Finance Act
  (
    '33333333-3333-3333-3333-000000000003',
    '11111111-1111-1111-1111-000000000003',
    'Florida Motor Vehicle Retail Sales Finance Act',
    'Fla. Stat. § 520.08',
    'https://www.leg.state.fl.us/statutes/index.cfm?App_mode=Display_Statute&URL=0500-0599/0520/Sections/0520.08.html',
    'A motor vehicle retail installment contract shall not provide for a finance charge '
    'that exceeds the maximum rate permitted by the Department of Financial Services. '
    'The practical maximum APR for licensed dealers is 30%.',
    '2024-01-01 00:00:00+00'
  ),

  -- GA: Georgia Motor Vehicle Sales Finance Act
  (
    '33333333-3333-3333-3333-000000000004',
    '11111111-1111-1111-1111-000000000004',
    'Georgia Motor Vehicle Sales Finance Act',
    'O.C.G.A. § 10-1-36',
    'https://law.justia.com/codes/georgia/title-10/chapter-1/article-1a/',
    'Under the Georgia Motor Vehicle Sales Finance Act, the maximum finance charge for '
    'retail installment sales of motor vehicles shall not exceed rates established by the '
    'Industrial Loan Commissioner, with an effective maximum APR of 21% for BHPH dealers.',
    '2024-01-01 00:00:00+00'
  ),

  -- OH: Ohio Consumer Installment Loan Act
  (
    '33333333-3333-3333-3333-000000000005',
    '11111111-1111-1111-1111-000000000005',
    'Ohio Consumer Installment Loan Act',
    'O.R.C. § 1321.391',
    'https://codes.ohio.gov/ohio-revised-code/section-1321.391',
    'No registrant shall charge, collect, or receive interest on a consumer installment '
    'loan at a rate that exceeds twenty-five percent per annum on the unpaid principal '
    'balance. This limit applies to retail installment sales of motor vehicles.',
    '2024-01-01 00:00:00+00'
  ),

  -- NC: North Carolina Consumer Finance Act
  (
    '33333333-3333-3333-3333-000000000006',
    '11111111-1111-1111-1111-000000000006',
    'North Carolina Consumer Finance Act',
    'N.C. Gen. Stat. § 53-173',
    'https://www.ncleg.gov/EnactedLegislation/Statutes/HTML/BySection/Chapter_53/GS_53-173.html',
    'A licensee may charge interest at a rate not exceeding 30 percent per year on '
    'the unpaid principal balance of any consumer finance loan. This rate applies to '
    'motor vehicle retail installment contracts originated by licensed dealers.',
    '2024-01-01 00:00:00+00'
  ),

  -- IN: Indiana Uniform Consumer Credit Code
  (
    '33333333-3333-3333-3333-000000000007',
    '11111111-1111-1111-1111-000000000007',
    'Indiana Uniform Consumer Credit Code',
    'I.C. § 24-4.5-3-508',
    'https://iga.in.gov/legislative/laws/2023/ic/titles/024#24-4.5-3-508',
    'With respect to a consumer credit sale, a seller may contract for and receive '
    'a finance charge not exceeding 36 percent per year on the unpaid principal balance. '
    'This ceiling applies to retail installment contracts for motor vehicles.',
    '2024-01-01 00:00:00+00'
  ),

  -- TN: Tennessee Industrial Loan and Thrift Companies Act
  (
    '33333333-3333-3333-3333-000000000008',
    '11111111-1111-1111-1111-000000000008',
    'Tennessee Industrial Loan and Thrift Companies Act',
    'Tenn. Code Ann. § 45-5-406',
    'https://law.justia.com/codes/tennessee/title-45/chapter-5/section-45-5-406/',
    'Industrial loan and thrift companies may charge simple interest at a rate not '
    'exceeding 24 percent per annum on consumer installment loans and retail installment '
    'sales contracts, including those for motor vehicles.',
    '2024-01-01 00:00:00+00'
  ),

  -- AL: Alabama Consumer Credit Act
  (
    '33333333-3333-3333-3333-000000000009',
    '11111111-1111-1111-1111-000000000009',
    'Alabama Consumer Credit Act',
    'Code of Ala. § 5-20-4',
    'https://law.justia.com/codes/alabama/title-5/chapter-20/section-5-20-4/',
    'A licensee under the Consumer Credit Act may charge, contract for, and receive '
    'interest on the unpaid principal balance at a rate not exceeding 27 percent per year '
    'for consumer installment loans and motor vehicle retail installment sales contracts.',
    '2024-01-01 00:00:00+00'
  ),

  -- AZ: Arizona Revised Statutes — Consumer Lenders
  (
    '33333333-3333-3333-3333-000000000010',
    '11111111-1111-1111-1111-000000000010',
    'Arizona Consumer Lender Act',
    'A.R.S. § 6-632',
    'https://www.azleg.gov/ars/6/00632.htm',
    'A consumer lender shall not charge an Annual Percentage Rate that exceeds '
    '36 percent per year, computed in accordance with the federal Truth in Lending Act, '
    'on any consumer loan or retail installment sales contract for a motor vehicle.',
    '2024-01-01 00:00:00+00'
  ),

  -- VA: Virginia Consumer Finance Act
  (
    '33333333-3333-3333-3333-000000000011',
    '11111111-1111-1111-1111-000000000011',
    'Virginia Consumer Finance Act',
    'Va. Code § 6.2-1526',
    'https://law.lis.virginia.gov/vacode/title6.2/chapter15/section6.2-1526/',
    'No consumer finance company licensee shall charge, collect, or receive interest '
    'on any consumer loan at a rate exceeding 36 percent per year, including all fees '
    'and charges. This limit applies to retail installment sales of motor vehicles.',
    '2024-01-01 00:00:00+00'
  )

ON CONFLICT (id) DO NOTHING;

-- -------------------------------------------------------------
-- 4. Rules — max_apr for each jurisdiction
--    comparison_op = 'lte' means loan APR must be <= threshold
--    threshold_value stored as percentage (e.g., 36.0000 = 36%)
-- -------------------------------------------------------------
INSERT INTO rules (
  id,
  jurisdiction_id,
  domain_id,
  rule_parameter,
  comparison_op,
  threshold_value,
  valid_from,
  display_description,
  severity,
  is_active,
  version
)
VALUES

  -- IL: max_apr <= 36.0000 (Predatory Loan Prevention Act)
  (
    '44444444-4444-4444-4444-000000000001',
    '11111111-1111-1111-1111-000000000001',
    '22222222-2222-2222-2222-000000000001',
    'max_apr', 'lte', 36.0000,
    '2021-03-23',
    'Illinois PLPA (815 ILCS 123/): APR may not exceed 36% on consumer loans '
    'including BHPH motor vehicle retail installment contracts.',
    'violation', true, 1
  ),

  -- TX: max_apr <= 27.0000 (Finance Code Ch. 348, highest tier)
  (
    '44444444-4444-4444-4444-000000000002',
    '11111111-1111-1111-1111-000000000002',
    '22222222-2222-2222-2222-000000000001',
    'max_apr', 'lte', 27.0000,
    '2001-01-01',
    'Texas Finance Code § 348.108: Maximum APR for BHPH motor vehicle '
    'retail installment contracts on vehicles more than two model years old is 27%.',
    'violation', true, 1
  ),

  -- FL: max_apr <= 30.0000 (F.S. Ch. 520)
  (
    '44444444-4444-4444-4444-000000000003',
    '11111111-1111-1111-1111-000000000003',
    '22222222-2222-2222-2222-000000000001',
    'max_apr', 'lte', 30.0000,
    '2001-01-01',
    'Florida F.S. § 520.08: Licensed motor vehicle dealers may not charge '
    'an APR exceeding 30% on retail installment sales contracts.',
    'violation', true, 1
  ),

  -- GA: max_apr <= 21.0000 (O.C.G.A. § 10-1-36)
  (
    '44444444-4444-4444-4444-000000000004',
    '11111111-1111-1111-1111-000000000004',
    '22222222-2222-2222-2222-000000000001',
    'max_apr', 'lte', 21.0000,
    '2001-01-01',
    'Georgia Motor Vehicle Sales Finance Act (O.C.G.A. § 10-1-36): '
    'Maximum APR for BHPH retail installment contracts is 21%.',
    'violation', true, 1
  ),

  -- OH: max_apr <= 25.0000 (O.R.C. § 1321.391)
  (
    '44444444-4444-4444-4444-000000000005',
    '11111111-1111-1111-1111-000000000005',
    '22222222-2222-2222-2222-000000000001',
    'max_apr', 'lte', 25.0000,
    '2001-01-01',
    'Ohio Consumer Installment Loan Act (O.R.C. § 1321.391): '
    'Maximum APR on consumer installment loans including BHPH contracts is 25%.',
    'violation', true, 1
  ),

  -- NC: max_apr <= 30.0000 (N.C.G.S. § 53-173)
  (
    '44444444-4444-4444-4444-000000000006',
    '11111111-1111-1111-1111-000000000006',
    '22222222-2222-2222-2222-000000000001',
    'max_apr', 'lte', 30.0000,
    '2001-01-01',
    'North Carolina Consumer Finance Act (N.C.G.S. § 53-173): '
    'Maximum APR for licensed consumer finance lenders is 30%.',
    'violation', true, 1
  ),

  -- IN: max_apr <= 36.0000 (I.C. § 24-4.5-3-508)
  (
    '44444444-4444-4444-4444-000000000007',
    '11111111-1111-1111-1111-000000000007',
    '22222222-2222-2222-2222-000000000001',
    'max_apr', 'lte', 36.0000,
    '2001-01-01',
    'Indiana Uniform Consumer Credit Code (I.C. § 24-4.5-3-508): '
    'Maximum APR on consumer credit sales of motor vehicles is 36%.',
    'violation', true, 1
  ),

  -- TN: max_apr <= 24.0000 (Tenn. Code Ann. § 45-5-406)
  (
    '44444444-4444-4444-4444-000000000008',
    '11111111-1111-1111-1111-000000000008',
    '22222222-2222-2222-2222-000000000001',
    'max_apr', 'lte', 24.0000,
    '2001-01-01',
    'Tennessee Industrial Loan and Thrift Companies Act (Tenn. Code Ann. § 45-5-406): '
    'Maximum simple interest rate on consumer installment contracts is 24% per annum.',
    'violation', true, 1
  ),

  -- AL: max_apr <= 27.0000 (Code of Ala. § 5-20-4)
  (
    '44444444-4444-4444-4444-000000000009',
    '11111111-1111-1111-1111-000000000009',
    '22222222-2222-2222-2222-000000000001',
    'max_apr', 'lte', 27.0000,
    '2001-01-01',
    'Alabama Consumer Credit Act (Code of Ala. § 5-20-4): '
    'Maximum APR on consumer installment loans including BHPH contracts is 27%.',
    'violation', true, 1
  ),

  -- AZ: max_apr <= 36.0000 (A.R.S. § 6-632)
  (
    '44444444-4444-4444-4444-000000000010',
    '11111111-1111-1111-1111-000000000010',
    '22222222-2222-2222-2222-000000000001',
    'max_apr', 'lte', 36.0000,
    '2001-01-01',
    'Arizona Consumer Lender Act (A.R.S. § 6-632): '
    'Maximum APR on consumer loans and motor vehicle retail installment contracts is 36%.',
    'violation', true, 1
  ),

  -- VA: max_apr <= 36.0000 (Va. Code § 6.2-1526)
  (
    '44444444-4444-4444-4444-000000000011',
    '11111111-1111-1111-1111-000000000011',
    '22222222-2222-2222-2222-000000000001',
    'max_apr', 'lte', 36.0000,
    '2001-01-01',
    'Virginia Consumer Finance Act (Va. Code § 6.2-1526): '
    'Consumer finance licensees may not charge APR exceeding 36% on retail installment contracts.',
    'violation', true, 1
  )

ON CONFLICT (id) DO NOTHING;

-- -------------------------------------------------------------
-- 5. Rule–Statute Links
--    Each rule linked to its authoritative statute reference
-- -------------------------------------------------------------
INSERT INTO rule_statute_links (id, rule_id, statute_reference_id)
VALUES
  -- IL
  ('55555555-5555-5555-5555-000000000001',
   '44444444-4444-4444-4444-000000000001',
   '33333333-3333-3333-3333-000000000001'),
  -- TX
  ('55555555-5555-5555-5555-000000000002',
   '44444444-4444-4444-4444-000000000002',
   '33333333-3333-3333-3333-000000000002'),
  -- FL
  ('55555555-5555-5555-5555-000000000003',
   '44444444-4444-4444-4444-000000000003',
   '33333333-3333-3333-3333-000000000003'),
  -- GA
  ('55555555-5555-5555-5555-000000000004',
   '44444444-4444-4444-4444-000000000004',
   '33333333-3333-3333-3333-000000000004'),
  -- OH
  ('55555555-5555-5555-5555-000000000005',
   '44444444-4444-4444-4444-000000000005',
   '33333333-3333-3333-3333-000000000005'),
  -- NC
  ('55555555-5555-5555-5555-000000000006',
   '44444444-4444-4444-4444-000000000006',
   '33333333-3333-3333-3333-000000000006'),
  -- IN
  ('55555555-5555-5555-5555-000000000007',
   '44444444-4444-4444-4444-000000000007',
   '33333333-3333-3333-3333-000000000007'),
  -- TN
  ('55555555-5555-5555-5555-000000000008',
   '44444444-4444-4444-4444-000000000008',
   '33333333-3333-3333-3333-000000000008'),
  -- AL
  ('55555555-5555-5555-5555-000000000009',
   '44444444-4444-4444-4444-000000000009',
   '33333333-3333-3333-3333-000000000009'),
  -- AZ
  ('55555555-5555-5555-5555-000000000010',
   '44444444-4444-4444-4444-000000000010',
   '33333333-3333-3333-3333-000000000010'),
  -- VA
  ('55555555-5555-5555-5555-000000000011',
   '44444444-4444-4444-4444-000000000011',
   '33333333-3333-3333-3333-000000000011')
ON CONFLICT (rule_id, statute_reference_id) DO NOTHING;

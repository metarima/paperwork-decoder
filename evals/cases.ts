// Synthetic letters used both as demo samples and as the eval set. Every
// organisation, person and number here is made up.

export type EvalCase = {
  id: string;
  title: string;
  letter: { letterhead: string[]; date: string; body: string };
  expected: {
    language: string;
    urgency: "low" | "medium" | "high";
    deadlines: string[]; // ISO dates that must be found
    amounts: { value: number; currency: string }[]; // amounts that must be found
  };
};

export const CASES: EvalCase[] = [
  {
    id: "pt-property-tax",
    title: "Portuguese property tax notice",
    letter: {
      letterhead: ["SERVIÇO MUNICIPAL DE FINANÇAS DE VILA NOVA DO MAR", "Rua do Exemplo, 12 · 4000-000 Vila Nova do Mar"],
      date: "Vila Nova do Mar, 15 de setembro de 2026",
      body: `Exmo(a). Sr(a). Rui Exemplo
Av. da Amostra, 45, 2.º Esq.
4000-123 Vila Nova do Mar

Assunto: Nota de cobrança — Imposto Municipal sobre Imóveis (IMI) 2025, 2.ª prestação

Documento n.º 2026/IMI/0048213

Fica V. Exa. notificado(a) de que se encontra a pagamento a 2.ª prestação do Imposto Municipal sobre Imóveis referente ao ano de 2025, relativa ao prédio urbano inscrito na matriz sob o artigo 3471, fração B.

Valor a pagar: 312,40 €

O pagamento deverá ser efetuado até 31 de outubro de 2026, através da referência de pagamento indicada abaixo, em qualquer caixa multibanco, homebanking ou balcão dos CTT.

Entidade: 21312   Referência: 481 293 776   Montante: 312,40 €

A falta de pagamento no prazo indicado implica a instauração de processo de execução fiscal e a liquidação de juros de mora, à taxa legal em vigor, sobre o montante em dívida.

Com os melhores cumprimentos,
O Chefe de Serviço`,
    },
    expected: {
      language: "Portuguese",
      urgency: "medium",
      deadlines: ["2026-10-31"],
      amounts: [{ value: 312.4, currency: "EUR" }],
    },
  },
  {
    id: "uk-parking-pcn",
    title: "UK parking penalty charge notice",
    letter: {
      letterhead: ["BOROUGH OF EXAMPLEFORD", "Parking Services · PO Box 000 · Exampleford EX1 0AA"],
      date: "22 September 2026",
      body: `Ms A. Sample
14 Placeholder Road
Exampleford EX2 3ZZ

PENALTY CHARGE NOTICE — NOTICE TO OWNER
PCN number: EF40219876
Vehicle registration: EX21 ABC
Contravention: 12 — Parked in a residents' or shared use parking place without clearly displaying a valid permit
Date and time of contravention: 9 September 2026, 14:37
Location: Maple Street, Exampleford

A penalty charge of £70.00 is now payable. If you pay within 14 days of the date of this notice, i.e. by 6 October 2026, the charge will be reduced to £35.00.

If the penalty charge is not paid or a representation is not received within 28 days of the date of this notice (by 20 October 2026), the council may increase the charge by 50% to £105.00 by issuing a Charge Certificate.

To pay or challenge this notice, visit the council website and quote your PCN number. You can make representations if you believe the penalty charge should not have been issued.

Parking Services Manager`,
    },
    expected: {
      language: "English",
      urgency: "high",
      deadlines: ["2026-10-06", "2026-10-20"],
      amounts: [
        { value: 35, currency: "GBP" },
        { value: 70, currency: "GBP" },
      ],
    },
  },
  {
    id: "de-broadcast-fee-reminder",
    title: "German broadcast fee reminder",
    letter: {
      letterhead: ["BEITRAGSSERVICE MUSTERSTADT", "Beispielweg 1 · 10000 Musterstadt"],
      date: "Musterstadt, 18. September 2026",
      body: `Frau Maria Beispiel
Probestraße 7
10115 Musterstadt

Zahlungserinnerung
Beitragsnummer: 489 312 775

Sehr geehrte Frau Beispiel,

für Ihre Wohnung ist der Rundfunkbeitrag für den Zeitraum 01.07.2026 bis 30.09.2026 noch nicht bei uns eingegangen. Der offene Betrag beläuft sich auf 55,08 Euro.

Bitte überweisen Sie den Betrag bis zum 15.10.2026 auf das folgende Konto:
IBAN: DE12 5001 0517 0000 1234 56
Verwendungszweck: 489312775

Sollte der Betrag nicht fristgerecht eingehen, erhalten Sie einen Festsetzungsbescheid; dabei wird ein Säumniszuschlag von 8,00 Euro fällig.

Falls Sie bereits gezahlt haben, betrachten Sie dieses Schreiben bitte als gegenstandslos.

Mit freundlichen Grüßen
Ihr Beitragsservice`,
    },
    expected: {
      language: "German",
      urgency: "medium",
      deadlines: ["2026-10-15"],
      amounts: [{ value: 55.08, currency: "EUR" }],
    },
  },
  {
    id: "uk-rent-increase",
    title: "Landlord rent increase notice",
    letter: {
      letterhead: ["OAKBRIDGE LETTINGS (FICTIONAL)", "3 Sample Court · Exampleford EX1 4BB"],
      date: "1 September 2026",
      body: `Dear Mr J. Placeholder,

Re: Flat 2, 88 Example Lane, Exampleford EX3 1CC

We are writing on behalf of your landlord to give you notice of a proposed rent increase under your periodic tenancy.

Your current rent is £1,150.00 per calendar month. From 1 December 2026 your rent will be £1,240.00 per calendar month.

If you agree to the new rent, you do not need to do anything; simply pay the new amount from the date above. If you believe the increase is higher than the market rate, you may be able to challenge it by applying to the relevant tribunal before 1 December 2026.

If you have any questions, please contact us on 01234 000000.

Kind regards,
Property Management Team`,
    },
    expected: {
      language: "English",
      urgency: "medium",
      deadlines: ["2026-12-01"],
      amounts: [
        { value: 1240, currency: "GBP" },
        { value: 1150, currency: "GBP" },
      ],
    },
  },
  {
    id: "es-water-bill",
    title: "Spanish water bill",
    letter: {
      letterhead: ["AGUAS DE VILLAEJEMPLO (FICTICIA)", "Calle Muestra 5 · 28000 Villaejemplo"],
      date: "Villaejemplo, 10 de septiembre de 2026",
      body: `Sr. Carlos Ejemplo
C/ Prueba 22, 3.º B
28001 Villaejemplo

Factura n.º AV-2026-0917734
Periodo de facturación: 01/07/2026 – 31/08/2026
Consumo: 14 m³

Importe total de la factura: 48,73 €

El importe se cargará en su cuenta bancaria domiciliada el día 25/09/2026. No tiene que realizar ninguna acción.

Si desea consultar el detalle de su consumo o modificar sus datos de domiciliación, puede hacerlo en nuestra oficina virtual.

Atentamente,
Atención al Cliente`,
    },
    expected: {
      language: "Spanish",
      urgency: "low",
      deadlines: [],
      amounts: [{ value: 48.73, currency: "EUR" }],
    },
  },
  {
    id: "pt-residence-appointment",
    title: "Residence permit appointment",
    letter: {
      letterhead: ["AGÊNCIA DE MIGRAÇÃO DE VILA NOVA DO MAR (FICTÍCIA)", "Praça da Amostra, 1 · 4000-001 Vila Nova do Mar"],
      date: "Vila Nova do Mar, 20 de setembro de 2026",
      body: `Exma. Sra. Olena Exemplo

Assunto: Convocatória — Renovação de autorização de residência
Processo n.º 2026/AR/77102

Informamos que foi agendado o seu atendimento presencial para renovação de autorização de residência:

Data: 14 de outubro de 2026, às 10h30
Local: Balcão 3, Praça da Amostra, 1

Deverá apresentar-se com: passaporte válido, título de residência atual, comprovativo de morada, comprovativo de meios de subsistência e comprovativo de pagamento da taxa de 90,00 €.

A falta de comparência sem justificação implica o cancelamento do agendamento, devendo ser efetuado novo pedido.

Com os melhores cumprimentos,
Os Serviços`,
    },
    expected: {
      language: "Portuguese",
      urgency: "high",
      deadlines: ["2026-10-14"],
      amounts: [{ value: 90, currency: "EUR" }],
    },
  },
  {
    id: "pt-employment-contract",
    title: "Portuguese employment contract",
    letter: {
      letterhead: ["LUSOTEC SOLUÇÕES, LDA. (FICTÍCIA)", "Rua da Amostra, 88 · 1000-000 Lisboa"],
      date: "Lisboa, 2 de novembro de 2026",
      body: `Exmo. Sr. Daniel Exemplo
Rua do Teste, 21, 3.º Dto.
1100-200 Lisboa

CONTRATO DE TRABALHO SEM TERMO

Entre Lusotec Soluções, Lda., adiante designada Empregadora, e Daniel Exemplo, adiante designado Trabalhador, é celebrado o presente contrato de trabalho, que se rege pelas cláusulas seguintes.

Cláusula 1.ª — Funções: o Trabalhador é admitido para exercer as funções de Analista de Dados.
Cláusula 2.ª — Início: o contrato produz efeitos a partir de 1 de dezembro de 2026.
Cláusula 3.ª — Período experimental: 180 dias, durante os quais qualquer das partes pode denunciar o contrato sem aviso prévio nem indemnização.
Cláusula 4.ª — Retribuição: 2.150,00 € ilíquidos mensais, pagos 14 vezes por ano, acrescidos de subsídio de refeição de 10,20 € por dia útil.
Cláusula 5.ª — Horário: 40 horas semanais, de segunda a sexta-feira, podendo ser adaptado em regime de banco de horas.
Cláusula 6.ª — Denúncia: o Trabalhador pode denunciar o contrato mediante aviso prévio de 30 ou 60 dias, conforme tenha até dois anos ou mais de dois anos de antiguidade.
Cláusula 7.ª — Não concorrência: durante 12 meses após a cessação do contrato, o Trabalhador não pode exercer atividade concorrente em território nacional.

Solicitamos a devolução de um exemplar assinado até 20 de novembro de 2026.

Com os melhores cumprimentos,
Departamento de Recursos Humanos`,
    },
    expected: {
      language: "Portuguese",
      urgency: "medium",
      deadlines: ["2026-11-20", "2026-12-01"],
      amounts: [{ value: 2150, currency: "EUR" }],
    },
  },
  {
    id: "uk-employment-contract",
    title: "UK employment contract",
    letter: {
      letterhead: ["NORTHGATE ANALYTICS LTD (FICTIONAL)", "12 Example Street · Exampleford EX4 7QT"],
      date: "3 November 2026",
      body: `Mr S. Placeholder
9 Sample Lane
Exampleford EX3 8PL

STATEMENT OF MAIN TERMS OF EMPLOYMENT

This statement sets out the main terms on which Northgate Analytics Ltd ("the Company") employs you.

1. Job title: Data Analyst.
2. Start date: your employment begins on 1 December 2026. No previous employment counts towards your continuous employment.
3. Probation: the first 6 months are a probationary period, during which either party may end your employment with one week's notice.
4. Salary: £38,500 per year, paid monthly in arrears on the last working day of each month.
5. Hours: 37.5 hours per week, Monday to Friday. You may be required to work additional hours without further pay where reasonably necessary.
6. Holiday: 25 days per year plus bank holidays.
7. Notice: after probation, you must give one month's notice. The Company will give you the statutory minimum notice.
8. Restrictions: for 6 months after your employment ends, you must not work for a competitor within 25 miles of any Company office.
9. Training costs: if you leave within 12 months of completing a qualification funded by the Company, you must repay its full cost.

Please sign and return one copy by 20 November 2026 to confirm your acceptance. If we do not receive it by then, this offer may be withdrawn.

Yours sincerely,
People Team`,
    },
    expected: {
      language: "English",
      urgency: "medium",
      deadlines: ["2026-11-20", "2026-12-01"],
      amounts: [{ value: 38500, currency: "GBP" }],
    },
  },
];

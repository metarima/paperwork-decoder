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
];

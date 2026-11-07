// Made-up results for the dev-only /preview route, so every screen state can
// be reviewed without an API key. Dates are relative to today so "overdue" and
// "in 12 days" stay true whenever the preview is opened.
import type { DecodeUsage } from "./decode";
import type { LetterAnalysis } from "./schema";

function isoFromToday(days: number) {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export const fixtureUsage: DecodeUsage = { model: "claude-sonnet-5-5", inputTokens: 3184, outputTokens: 1127, costUsd: 0.0264, ms: 14_200 };

export function propertyTax(deadlineInDays: number): LetterAnalysis {
  return {
    sender: "Serviço Municipal de Finanças de Vila Nova do Mar",
    letterType: "Property tax notice",
    language: "Portuguese",
    languageCode: "pt",
    summary: "Your second property tax (IMI) payment for 2025 is due: pay €312.40 by the deadline.",
    explanation:
      "This is a payment notice from your local tax office for IMI, the yearly tax on property you own in Portugal. The 2025 tax is split into instalments, and this letter is about the second one.\n\nYou can pay at any Multibanco ATM, in your online banking (look for 'Pagamento de serviços' or 'Pagamentos ao Estado'), or at a CTT post office counter. You'll need the Entidade and Referência numbers below, and the exact amount.\n\nIf the payment doesn't arrive in time, the tax office starts a tax enforcement process (execução fiscal) and adds late-payment interest at the legal rate.",
    urgency: "medium",
    deadlines: [{ date: isoFromToday(deadlineInDays), what: "Pay the second IMI instalment for 2025" }],
    amounts: [{ value: 312.4, currency: "EUR", reason: "IMI 2025, second instalment" }],
    actions: [
      {
        step: "Pay €312.40",
        how: "At a Multibanco ATM or in online banking, choose 'Pagamento de serviços' and enter Entidade 21312, Referência 481 293 776 and the amount 312.40 €.",
      },
      { step: "Keep the receipt", how: "Save the ATM slip or a screenshot of the banking confirmation until next year." },
      {
        step: "Check the property details",
        how: "Make sure the property (artigo 3471, fração B) is yours. If it isn't, contact the tax office before paying.",
      },
    ],
    consequencesIfIgnored:
      "The tax office opens a tax enforcement case (execução fiscal) and adds late-payment interest to what you owe.",
    referenceNumbers: [
      { label: "Entidade", value: "21312" },
      { label: "Referência", value: "481 293 776" },
      { label: "Montante", value: "312,40 €" },
      { label: "Documento n.º", value: "2026/IMI/0048213" },
    ],
    confidence: "high",
    uncertainties: [],
  };
}

// The same notice explained in Portuguese, to preview the interface with
// matching AI text (/preview?state=result&lang=pt).
export function propertyTaxPt(deadlineInDays: number): LetterAnalysis {
  return {
    ...propertyTax(deadlineInDays),
    letterType: "Nota de cobrança de IMI",
    summary: "A segunda prestação do IMI de 2025 está a pagamento: tem de pagar 312,40 € até ao fim do prazo.",
    explanation:
      "Esta carta é uma nota de cobrança do serviço de finanças da sua zona sobre o IMI, o imposto anual sobre os imóveis que tem em Portugal. O imposto de 2025 foi dividido em prestações e esta carta diz respeito à segunda.\n\nPode pagar em qualquer caixa Multibanco, no homebanking (procure 'Pagamento de serviços' ou 'Pagamentos ao Estado') ou num balcão dos CTT. Vai precisar dos números de Entidade e Referência abaixo e do valor exato.\n\nSe o pagamento não chegar a tempo, as Finanças abrem um processo de execução fiscal e cobram juros de mora à taxa legal.",
    deadlines: [{ date: isoFromToday(deadlineInDays), what: "Pagar a 2.ª prestação do IMI de 2025" }],
    amounts: [{ value: 312.4, currency: "EUR", reason: "IMI 2025, 2.ª prestação" }],
    actions: [
      {
        step: "Pagar 312,40 €",
        how: "Num Multibanco ou no homebanking, escolha 'Pagamento de serviços' e introduza a Entidade 21312, a Referência 481 293 776 e o valor 312,40 €.",
      },
      { step: "Guardar o comprovativo", how: "Guarde o talão do Multibanco ou uma captura do comprovativo do banco até ao próximo ano." },
      {
        step: "Confirmar os dados do imóvel",
        how: "Confirme que o imóvel (artigo 3471, fração B) é seu. Se não for, contacte as Finanças antes de pagar.",
      },
    ],
    consequencesIfIgnored: "As Finanças abrem um processo de execução fiscal e acrescentam juros de mora ao valor em dívida.",
  };
}

export const chatMessagesPt: { role: "user" | "assistant"; content: string }[] = [
  { role: "user", content: "Posso pagar em prestações?" },
  {
    role: "assistant",
    content:
      "Esta carta já é uma prestação: o IMI de 2025 foi dividido e esta é a **segunda**. A carta não prevê dividir mais os 312,40 €.\n\nSe não conseguir pagar a tempo, contacte o serviço de finanças antes do fim do prazo e pergunte por um plano prestacional.",
  },
];

export function blurryReminder(): LetterAnalysis {
  return {
    sender: "Beitragsservice Musterstadt",
    letterType: "Broadcast fee reminder",
    language: "German",
    languageCode: "de",
    summary: "A reminder that your broadcast fee for July to September hasn't been paid. It looks like €55.08 is due.",
    explanation:
      "Germany charges every household a broadcast fee (Rundfunkbeitrag), whether or not you own a TV. This letter says the payment for July to September 2026 hasn't arrived.\n\nThe photo is blurred in the lower half, so the bank details and the amount of the late fee are hard to read. Compare them with the paper letter before you transfer anything.",
    urgency: "medium",
    deadlines: [{ date: isoFromToday(9), what: "Transfer the open amount" }],
    amounts: [
      { value: 55.08, currency: "EUR", reason: "Broadcast fee, July to September 2026" },
      { value: 8, currency: "EUR", reason: "Late fee if it isn't paid in time" },
    ],
    actions: [
      {
        step: "Check whether you've already paid",
        how: "Look in your bank statements for a payment to Beitragsservice since July. If you have, the letter says you can ignore it.",
      },
      {
        step: "Transfer €55.08",
        how: "Send it to the IBAN on the letter with Verwendungszweck 489312775 as the payment reference.",
      },
    ],
    consequencesIfIgnored: "You'll get a formal assessment notice (Festsetzungsbescheid) and an €8.00 late fee is added.",
    referenceNumbers: [
      { label: "Beitragsnummer", value: "489 312 775" },
      { label: "IBAN", value: "DE12 5001 0517 0000 1234 56" },
      { label: "Verwendungszweck", value: "489312775" },
    ],
    confidence: "low",
    uncertainties: [
      "The IBAN is partly blurred. Check every digit against the letter.",
      "The late fee might be €8.00 or €6.00; the figure is hard to read.",
      "The deadline date is cut off at the edge of the photo.",
    ],
  };
}

export const replyText = `Exmo(a). Senhor(a) Chefe de Serviço,

Assunto: Documento n.º 2026/IMI/0048213 — IMI 2025, 2.ª prestação

Venho por este meio informar que irei proceder ao pagamento da 2.ª prestação do IMI de 2025, no valor de 312,40 €, através da Entidade 21312 e da Referência 481 293 776.

Agradeço que me enviem a confirmação da receção do pagamento.

Com os melhores cumprimentos,
[O seu nome]
[O seu NIF]
[A sua morada]
---
Dear Head of Service,

Subject: Document no. 2026/IMI/0048213 — IMI 2025, 2nd instalment

I am writing to let you know that I will pay the second instalment of the 2025 IMI, for the amount of €312.40, using Entidade 21312 and Referência 481 293 776.

Please send me confirmation that the payment has been received.

Kind regards,
[Your name]
[Your tax number (NIF)]
[Your address]`;

export const chatMessages: { role: "user" | "assistant"; content: string }[] = [
  { role: "user", content: "Can I pay in instalments?" },
  {
    role: "assistant",
    content:
      "This letter is already one instalment: your 2025 IMI was split, and this is the **second payment**. The letter doesn't offer a way to split €312.40 further.\n\nIf you can't pay it in time, contact the tax office (Serviço de Finanças) before the deadline and ask about a payment plan (plano prestacional). Once a tax enforcement case is open, interest is added.",
  },
  { role: "user", content: "Do I need a Portuguese bank account to pay?" },
  {
    role: "assistant",
    content:
      "Not necessarily. You can pay with any card at a Multibanco ATM in Portugal, or at a CTT post office counter. Online, you'll usually need a Portuguese bank's app to pay with Entidade and Referência.",
  },
];

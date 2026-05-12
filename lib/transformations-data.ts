// lib/transformations-data.ts
//
// Anonymized client success stories featured on /transformations.
// Single-image editorial cards (alternating split layout) — see
// app/transformations/page.tsx. Images live in /public/media/transformations/.

export type Transformation = {
  /** url-safe handle, used for keys and section anchors */
  slug: string;
  /** display numeral rendered as the decorative anchor */
  index: string;
  /** anonymised category, e.g. "Postpartum recovery" */
  category: string;
  /** age + short context, e.g. "27, new mother & content creator" */
  ageNote: string;
  /** program length, e.g. "2 months" */
  duration: string;
  /** headline before → after metric */
  metric: {
    label: string;
    from: string;
    to: string;
  };
  /** 2–4 short outcome wins */
  highlights: string[];
  /** 2–3 short narrative paragraphs */
  story: string[];
  image: string;
  imageAlt: string;
};

export const TRANSFORMATIONS: readonly Transformation[] = [
  {
    slug: "postpartum-recovery-27",
    index: "01",
    category: "Postpartum recovery",
    ageNote: "27 · new mother & content creator",
    duration: "2 months",
    metric: { label: "Weight", from: "62 kg", to: "56 kg" },
    highlights: [
      "Toned, photo-ready body shape",
      "Postpartum energy and confidence restored",
      "Sustainable habits — no extreme diets",
    ],
    story: [
      "After delivering her baby, she wanted to feel at home in her body again — especially as someone who regularly appears in front of the camera. Motherhood, recovery, and a busy lifestyle had made weight management feel out of reach.",
      "We didn't chase a number. The plan was a balanced approach built around proper nutrition, portion control, nourishing meals, hydration, and habits she could keep. No shortcuts, no restriction.",
      "Within two months her weight moved from 62 kg to 56 kg, and the shape that came with it was the part she noticed first — softer in the right places, stronger overall. The bigger win was the energy and self-trust she walked back into.",
    ],
    image: "/media/transformations/01.jpg",
    imageAlt: "Anonymous client portrait, postpartum recovery success story",
  },
  {
    slug: "over-supplementation-reset-30",
    index: "02",
    category: "Over-supplementation reset",
    ageNote: "30 · fertility-focused",
    duration: "3 months",
    metric: { label: "Weight", from: "76 kg", to: "64 kg" },
    highlights: [
      "Unnecessary supplements stripped back",
      "Hormonal and nutritional profile rebalanced",
      "Energy and well-being restored",
    ],
    story: [
      "Worried about her fertility, she had begun layering supplements on her own — without professional guidance. Over time the stack worked against her: weight crept up, energy dropped, and her body lost its nutritional balance.",
      "Our first move was to reset. We pulled back the unnecessary supplementation, rebuilt the foundation with whole-food nutrition, and supported hormonal health through structured, sustainable eating instead.",
      "Three months later she had moved from 76 kg to 64 kg, but the more telling shift was how her body responded — steadier energy, better recovery, and a sense that things were finally working with her instead of against her.",
    ],
    image: "/media/transformations/02.jpg",
    imageAlt: "Anonymous client portrait, over-supplementation reset success story",
  },
  {
    slug: "pcos-trying-to-conceive-29",
    index: "03",
    category: "PCOS · trying to conceive",
    ageNote: "29",
    duration: "6 months",
    metric: { label: "Weight", from: "200 lbs", to: "169 lbs" },
    highlights: [
      "Menstrual cycle returned within 2 months — after a 2-year absence",
      "Insulin sensitivity and inflammation improved",
      "Conceived successfully",
    ],
    story: [
      "Severe PCOS had taken its toll. She hadn't had a period in nearly two years, energy was at the floor, and conceiving felt further away each month. By the time she started the program she was at 200 lbs and frustrated with everything she had already tried.",
      "The plan was built for her hormones: nutrition that supported insulin sensitivity, reduced inflammation, and gave her body the raw materials to find its own rhythm again — slowly, sustainably, without quick-fix promises.",
      "The first milestone came in month two: her cycle returned. Over the next six months her weight moved from 200 lbs to 169 lbs, but the headline was bigger than the scale. Her hormones found their footing, and she went on to conceive naturally.",
    ],
    image: "/media/transformations/03.jpg",
    imageAlt: "Anonymous client portrait, PCOS and fertility success story",
  },
  {
    slug: "postnatal-body-composition-32",
    index: "04",
    category: "Postnatal body composition",
    ageNote: "32 · busy mother",
    duration: "3 months",
    metric: { label: "Weight", from: "69 kg", to: "62 kg" },
    highlights: [
      "Leaner, more defined composition",
      "Energy for daily life and motherhood",
      "Habits that fit a full schedule",
    ],
    story: [
      "Managing family life left little room for her own health. Weight loss wasn't really the brief — she wanted to feel fit, confident, and to see a shape that matched how she wanted to feel.",
      "We focused on body composition, not the scale: balanced meals, consistent structure, and lifestyle adjustments that respected an already-full schedule. The goal was a leaner, more defined physique, sustained.",
      "Three months in, she had moved from 69 kg to 62 kg with the leaner shape she had been after. Beyond the visible change, the energy and motivation she found day-to-day were the part she talked about most.",
    ],
    image: "/media/transformations/04.jpg",
    imageAlt: "Anonymous client portrait, postnatal body composition success story",
  },
  {
    slug: "pcos-eight-years-trying-25",
    index: "05",
    category: "PCOS · 8 years trying",
    ageNote: "25",
    duration: "6 months",
    metric: { label: "Weight", from: "88 kg", to: "73 kg" },
    highlights: [
      "Regular, on-time cycles from month one",
      "Skin and hormonal balance improved",
      "Conceived naturally — no medication",
    ],
    story: [
      "Eight years of trying to conceive. PCOS had left her cycles irregular and unpredictable, and the weight, skin concerns, and confidence dips that came with the hormonal picture made it harder still.",
      "We built the program around her hormones: nutrition that supported insulin and hormonal balance, paired with the lifestyle structure her body had been asking for.",
      "By the end of the first month her cycle had regulated for the first time in years. Six months in, her weight had moved from 88 kg to 73 kg, her skin had cleared, and — most importantly — she conceived naturally, without medication.",
    ],
    image: "/media/transformations/05.jpg",
    imageAlt: "Anonymous client portrait, PCOS and natural conception success story",
  },
];

/*
 * Esha Naturals — categories & products
 * ------------------------------------------------------------------
 * To change a price, edit `price` (selling price) and `comparePrice` (original price).
 * To add a product, copy one block, give it a new unique `id`, and add its images to
 * assets/images/products/ (transparent bottle) and assets/images/posters/ (poster).
 */
window.ESHA = window.ESHA || {};

ESHA.categories = [
  {
    id: 'hair-care',
    name: 'Hair Care',
    title: 'Hair Care Oils',
    tagline: 'Nourish from root to tip',
    description:
      'Nourishing blends of amla, castor, coconut and other natural ingredients for stronger, thicker and healthier-looking hair.',
    icon: 'hair',
    glow: 'rgba(169, 178, 95, 0.38)'
  },
  {
    id: 'cooking-oils',
    name: 'Cooking Oils',
    title: 'Pure Cooking Oils',
    tagline: 'Pure nutrition, pure goodness',
    description: 'Pure mustard and sesame oils with a rich aroma and authentic taste, for everyday cooking and traditional recipes.',
    icon: 'pot',
    glow: 'rgba(224, 165, 58, 0.4)'
  }
];

ESHA.products = [
  {
    id: 'anti-hair-fall-oil',
    name: 'Anti Hair Fall Oil',
    category: 'hair-care',
    size: '250 ml',
    price: 1099,
    comparePrice: 1799,
    tagline: 'For strong, thick & healthy hair',
    motto: 'Nourishes. Strengthens. Revives.',
    shortDescription: 'Specially formulated to help reduce hair fall and strengthen hair from the roots.',
    description:
      'Esha Naturals Anti Hair Fall Oil is specially formulated to help reduce hair fall and strengthen hair from the roots. Its natural ingredients nourish the scalp, support healthy hair growth, and improve overall hair strength. Perfect for regular use as part of your hair care routine.',
    highlights: [
      { icon: 'hair', title: 'Reduces hair fall', text: 'Strengthens roots and helps reduce breakage' },
      { icon: 'sprout', title: 'Boosts hair growth', text: 'Supports healthy, thicker-looking hair' },
      { icon: 'drop', title: 'Nourishes scalp', text: 'Natural ingredients relieve dryness' },
      { icon: 'strength', title: 'Strengthens hair', text: 'For strong, thick and healthy hair' }
    ],
    ingredientsTitle: 'Enriched with natural ingredients',
    ingredients: [
      { name: 'Castor Oil', note: 'Strengthens hair and helps reduce hair fall' },
      { name: 'Amla', note: 'Rich in vitamin C, strengthens hair from the roots' },
      { name: 'Ritha', note: 'Natural cleanser that adds volume and bounce' }
    ],
    howToUse: [
      'Take a small amount of oil and apply it directly to your scalp, section by section.',
      'Massage gently with your fingertips for 5–10 minutes, then spread the oil along the lengths.',
      'Leave it on for at least 1–2 hours, or overnight for deeper nourishment.',
      'Wash with a mild shampoo. Use 2–3 times a week for best results.'
    ],
    details: [
      ['Pack size', '250 ml pump bottle'],
      ['Best for', 'Hair fall, weak and thinning-looking hair'],
      ['Use', 'Regular use, 2–3 times a week'],
      ['Promise', '100% original · Pure · Natural · Trusted']
    ],
    caution: 'For external use only. Avoid contact with eyes. Do a small patch test before first use.',
    images: {
      product: 'assets/images/products/anti-hair-fall-oil.webp',
      productSm: 'assets/images/products/anti-hair-fall-oil-sm.webp',
      poster: 'assets/images/posters/anti-hair-fall-oil.webp',
      posterSm: 'assets/images/posters/anti-hair-fall-oil-sm.webp',
      width: 267,
      height: 982,
      smWidth: 152,
      smHeight: 560
    },
    theme: { accent: '#d4a24c', tint: '#efe3c8', glow: 'rgba(212, 162, 76, 0.42)' }
  },
  {
    id: 'hair-care-oil',
    name: 'Hair Care Oil',
    category: 'hair-care',
    size: '250 ml',
    price: 899,
    comparePrice: 1599,
    tagline: 'For strong, thick & healthy hair',
    motto: 'Nourishes. Strengthens. Revives.',
    shortDescription: 'A nourishing blend for stronger, healthier and shinier hair. Suits all hair types.',
    description:
      'Esha Naturals Hair Care Oil is a nourishing blend designed to support stronger, healthier, and shinier hair. Enriched with natural ingredients, it helps nourish the scalp, improve hair texture, and reduce dryness. Ideal for regular hair care and all hair types.',
    highlights: [
      { icon: 'hair', title: 'Reduces hair fall', text: 'Helps keep hair strong from the roots' },
      { icon: 'sprout', title: 'Boosts hair growth', text: 'Castor and amla support healthy growth' },
      { icon: 'drop', title: 'Nourishes scalp', text: 'Soothes and moisturises a dry scalp' },
      { icon: 'strength', title: 'Strengthens hair', text: 'Smoother, shinier and stronger strands' }
    ],
    ingredientsTitle: 'Enriched with natural ingredients',
    ingredients: [
      { name: 'Coconut Oil', note: 'Moisturises hair, prevents dryness and breakage' },
      { name: 'Castor Oil', note: 'Promotes hair growth, thickness and strength' },
      { name: 'Amla', note: 'Rich in vitamin C, strengthens hair from the roots' },
      { name: 'Hibiscus Flower', note: 'Improves hair texture and softness' },
      { name: 'Rose Leaves', note: 'Soothes the scalp and adds natural shine' },
      { name: 'Almond Oil', note: 'Nourishes hair for smoother, healthier strands' }
    ],
    howToUse: [
      'Take a small amount of oil and apply it to your scalp and hair.',
      'Massage gently in circular motions for 5–10 minutes to nourish the scalp.',
      'Leave it on for 1–2 hours, or overnight for dry hair.',
      'Wash with a mild shampoo. Use 2–3 times a week as part of your routine.'
    ],
    details: [
      ['Pack size', '250 ml pump bottle'],
      ['Best for', 'All hair types · dryness, dullness and frizz'],
      ['Use', 'Regular hair care, 2–3 times a week'],
      ['Promise', '100% original · Pure · Natural · Trusted']
    ],
    caution: 'For external use only. Avoid contact with eyes. Do a small patch test before first use.',
    images: {
      product: 'assets/images/products/hair-care-oil.webp',
      productSm: 'assets/images/products/hair-care-oil-sm.webp',
      poster: 'assets/images/posters/hair-care-oil.webp',
      posterSm: 'assets/images/posters/hair-care-oil-sm.webp',
      width: 296,
      height: 1100,
      smWidth: 151,
      smHeight: 560
    },
    theme: { accent: '#a9b25f', tint: '#ebe7d0', glow: 'rgba(169, 178, 95, 0.36)' }
  },
  {
    id: 'mustard-oil',
    name: 'Mustard Cooking Oil',
    category: 'cooking-oils',
    size: '1 Litre',
    price: 750,
    comparePrice: 1000,
    tagline: 'For a healthy you & your family',
    motto: 'Pure Nutrition, Pure Goodness.',
    shortDescription: 'Pure and natural, with a rich aroma and authentic traditional taste.',
    description:
      'Esha Naturals Mustard Cooking Oil is a pure and natural choice with a rich aroma and authentic traditional taste. Carefully prepared for everyday cooking, it adds distinctive flavor to curries, frying, and homemade recipes. Enjoy trusted quality and natural goodness in every drop.',
    highlights: [
      { icon: 'drop', title: '100% pure mustard oil', text: 'Pure oil with nothing else added' },
      { icon: 'leaf', title: 'Natural & unrefined', text: 'Keeps its natural aroma and character' },
      { icon: 'steam', title: 'Rich aroma & authentic taste', text: 'The traditional desi flavour' },
      { icon: 'heart', title: 'Good for heart & health', text: 'Rich in monounsaturated fats' }
    ],
    ingredientsTitle: 'Why you will love it',
    ingredients: [
      { name: 'Bold, authentic flavour', note: 'The classic desi taste for curries, saag and achar' },
      { name: 'Made for high heat', note: 'Ideal for tadka, frying and everyday cooking' },
      { name: 'Natural goodness', note: 'Rich in monounsaturated fats with natural omega-3' }
    ],
    howToUse: [
      'Use for curries, frying, tadka, pickles (achar) and homemade recipes.',
      'Heat the oil well before adding spices to bring out its aroma.',
      'Store in a cool, dry place away from direct sunlight.',
      'Close the cap tightly after every use.'
    ],
    details: [
      ['Pack size', '1 Litre bottle'],
      ['Best for', 'Curries, frying, tadka, achar'],
      ['Type', 'Natural & unrefined cooking oil'],
      ['Promise', '100% original · Pure · Natural · Trusted']
    ],
    caution: 'Store in a cool, dry place. Keep away from direct sunlight.',
    images: {
      product: 'assets/images/products/mustard-oil.webp',
      productSm: 'assets/images/products/mustard-oil-sm.webp',
      poster: 'assets/images/posters/mustard-oil.webp',
      posterSm: 'assets/images/posters/mustard-oil-sm.webp',
      width: 326,
      height: 1096,
      smWidth: 167,
      smHeight: 560
    },
    theme: { accent: '#e0a53a', tint: '#f1e3c2', glow: 'rgba(224, 165, 58, 0.42)' }
  },
  {
    id: 'sesame-oil',
    name: 'Sesame Cooking Oil',
    category: 'cooking-oils',
    size: '1 Litre',
    price: 999,
    comparePrice: 1399,
    tagline: 'Pure sesame, more goodness for you & your family',
    motto: 'Pure · Natural · Trusted',
    shortDescription: 'Prepared from quality sesame seeds for everyday cooking and traditional recipes.',
    description:
      'Esha Naturals Sesame Oil is a pure and natural cooking oil with a rich aroma and authentic taste. Carefully prepared from quality sesame seeds, it is ideal for everyday cooking and traditional recipes. Enjoy natural goodness, purity, and trusted quality in every drop.',
    highlights: [
      { icon: 'sparkle', title: 'Rich in natural goodness', text: 'Prepared from quality sesame seeds' },
      { icon: 'heart', title: 'Good for heart health', text: 'Rich in unsaturated fats' },
      { icon: 'shield', title: 'Antioxidant properties', text: 'Natural sesamin and sesamolin' },
      { icon: 'pot', title: 'Perfect for cooking', text: 'Everyday dishes and traditional recipes' }
    ],
    ingredientsTitle: 'Why you will love it',
    ingredients: [
      { name: 'Quality sesame seeds', note: 'Carefully prepared for purity and taste' },
      { name: 'Natural antioxidants', note: 'Sesame naturally contains sesamin and sesamolin' },
      { name: 'Gentle, nutty aroma', note: 'Lifts everyday dishes and traditional recipes' }
    ],
    howToUse: [
      'Use for everyday cooking, sautéing, stir-fries and tadka.',
      'Drizzle over salads, chutneys or finished dishes for a nutty aroma.',
      'Store in a cool, dry place away from direct sunlight.',
      'Close the cap tightly after every use.'
    ],
    details: [
      ['Pack size', '1 Litre bottle'],
      ['Best for', 'Everyday cooking & traditional recipes'],
      ['Made from', 'Quality sesame seeds'],
      ['Promise', '100% original · Pure · Natural · Trusted']
    ],
    caution: 'Store in a cool, dry place. Keep away from direct sunlight.',
    images: {
      product: 'assets/images/products/sesame-oil.webp',
      productSm: 'assets/images/products/sesame-oil-sm.webp',
      poster: 'assets/images/posters/sesame-oil.webp',
      posterSm: 'assets/images/posters/sesame-oil-sm.webp',
      width: 326,
      height: 1096,
      smWidth: 167,
      smHeight: 560
    },
    theme: { accent: '#a57cc0', tint: '#ece2ea', glow: 'rgba(165, 124, 192, 0.36)' }
  }
];

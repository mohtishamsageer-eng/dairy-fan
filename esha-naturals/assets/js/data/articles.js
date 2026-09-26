/*
 * Esha Naturals — Journal (short articles on benefits)
 * ------------------------------------------------------------------
 * Each article: slug (used in the URL), topic, title, excerpt, cover image,
 * related products (ids from products.js) and the article body in HTML.
 */
window.ESHA = window.ESHA || {};

ESHA.topics = [
  { id: 'hair-care', name: 'Hair Care' },
  { id: 'kitchen', name: 'Kitchen & Nutrition' }
];

ESHA.articles = [
  {
    slug: 'why-hair-falls',
    topic: 'hair-care',
    title: 'Hair Fall: Common Causes & How Regular Oiling Helps',
    excerpt:
      'Losing some hair every day is normal. Here is what makes it worse, and the simple oiling habit that keeps roots nourished and strands stronger.',
    cover: 'assets/images/journal/why-hair-falls.webp',
    coverAlt: 'Fresh amla beside a bottle of Esha Naturals Anti Hair Fall Oil',
    products: ['anti-hair-fall-oil'],
    body: `
      <p class="lead">Finding a few strands on your comb is completely normal. Hair grows in cycles, and most people shed around 50–100 hairs a day. When you start noticing more on your pillow, brush or shower drain, it is usually a sign that your hair and scalp need a little extra care.</p>

      <h2>What makes hair fall worse?</h2>
      <ul>
        <li><strong>A dry, undernourished scalp.</strong> Roots need nourishment to hold strong strands.</li>
        <li><strong>Breakage.</strong> Harsh shampoos, heat styling, rough towel-drying and tight hairstyles all weaken hair.</li>
        <li><strong>Stress and poor sleep.</strong> Your hair often shows what your body is going through.</li>
        <li><strong>Diet.</strong> Too little protein, iron and vitamins can leave hair thin and weak.</li>
        <li><strong>Seasons, hard water and pollution.</strong> These dry out both scalp and strands.</li>
      </ul>

      <h2>How regular oiling helps</h2>
      <p>Oiling is one of the oldest hair care rituals in our homes, and for good reason. Massaging oil into the scalp nourishes it and reduces dryness, while coating the lengths protects strands from friction and breakage, one of the most common reasons hair starts to look thin.</p>
      <p>Ingredients like <strong>castor oil</strong>, <strong>amla</strong> and <strong>ritha</strong> have been trusted in traditional hair care for generations. They are the heart of Esha Naturals Anti Hair Fall Oil, blended to strengthen hair from the roots.</p>

      <blockquote>Consistency matters more than quantity. A gentle massage two to three times a week does more than a heavy application once a month.</blockquote>

      <h2>A simple anti hair fall routine</h2>
      <ol>
        <li>Apply the oil to your scalp section by section, 2–3 times a week.</li>
        <li>Massage with your fingertips (not nails) for 5–10 minutes.</li>
        <li>Leave it on for 1–2 hours, or overnight.</li>
        <li>Wash with a mild shampoo and lukewarm water, not hot.</li>
        <li>Detangle gently with a wide-tooth comb, and avoid tying wet hair tightly.</li>
      </ol>

      <h2>Support it from within</h2>
      <p>Eat enough protein, include fresh fruit and vegetables, drink plenty of water and try to sleep well. Healthy hair is built both inside and out.</p>

      <p class="note">If you notice sudden, patchy or very heavy hair loss, please consult a doctor or dermatologist, as it can point to an underlying health condition.</p>
    `
  },
  {
    slug: 'hair-oiling-ritual',
    topic: 'hair-care',
    title: 'The Right Way to Oil Your Hair: A 5-Step Ritual',
    excerpt: 'Oiling works best when it is done right. Follow this simple five-step ritual for a nourished scalp and softer, shinier hair.',
    cover: 'assets/images/journal/hair-oiling-ritual.webp',
    coverAlt: 'A bowl of fresh amla next to Esha Naturals Hair Care Oil',
    products: ['hair-care-oil'],
    body: `
      <p class="lead">Most of us grew up with a weekly champi. It is a beautiful ritual, but a few small changes can make it far more effective and far less messy. Here is how to get the most out of every drop.</p>

      <h2>The 5-step oiling ritual</h2>
      <ol>
        <li><strong>Start with detangled hair.</strong> Gently comb dry or slightly damp hair so the oil spreads evenly without pulling.</li>
        <li><strong>Warm it slightly (optional).</strong> Pour a little oil into a small bowl and place it in warm water for a minute. Lukewarm oil spreads easily. Never overheat it.</li>
        <li><strong>Section and apply.</strong> Part your hair into sections and apply the oil directly to the scalp along each parting.</li>
        <li><strong>Massage, don't scrub.</strong> Use your fingertips in small circles for 5–10 minutes. It relaxes you and nourishes the scalp.</li>
        <li><strong>Coat the lengths, then rest.</strong> Smooth the remaining oil down to the ends, leave it for 1–2 hours or overnight, then wash with a mild shampoo. Oily roots may need two rounds of shampoo.</li>
      </ol>

      <h2>How often should you oil?</h2>
      <ul>
        <li><strong>Dry or frizzy hair:</strong> 2–3 times a week.</li>
        <li><strong>Normal hair:</strong> twice a week.</li>
        <li><strong>Oily scalp:</strong> once or twice a week, focusing more on the lengths.</li>
      </ul>

      <h2>Common mistakes to avoid</h2>
      <ul>
        <li>Using too much oil, which only makes it harder to wash out.</li>
        <li>Rubbing hard with your nails, which can irritate the scalp.</li>
        <li>Leaving oil in for days, which can build up and attract dust.</li>
        <li>Tying oiled hair very tightly, which strains the roots.</li>
      </ul>

      <blockquote>Ideal for all hair types, Esha Naturals Hair Care Oil blends coconut, castor, amla, almond, hibiscus and rose for everyday nourishment.</blockquote>

      <p class="note">For external use only. Do a small patch test before using any new hair oil.</p>
    `
  },
  {
    slug: 'hair-oil-ingredients',
    topic: 'hair-care',
    title: "Amla, Castor, Coconut & More: What's Inside Our Hair Oils",
    excerpt:
      'A closer look at the natural ingredients in Esha Naturals hair oils, and why each one has earned its place in traditional hair care.',
    cover: 'assets/images/journal/hair-oil-ingredients.webp',
    coverAlt: 'Esha Naturals Hair Care Oil and Anti Hair Fall Oil side by side',
    products: ['anti-hair-fall-oil', 'hair-care-oil'],
    body: `
      <p class="lead">Great hair care starts with honest ingredients. Here is what goes into Esha Naturals hair oils, and what each ingredient is known for.</p>

      <h2>Amla (Indian gooseberry)</h2>
      <p>Naturally rich in vitamin C and antioxidants, amla has been used for generations to strengthen hair from the roots and bring back natural shine. You will find it in both of our hair oils.</p>

      <h2>Castor oil</h2>
      <p>A rich, thick oil high in ricinoleic acid. It coats each strand, locks in moisture and gives hair a fuller, thicker look. It is also in both oils.</p>

      <h2>Coconut oil</h2>
      <p>One of the few oils that can penetrate the hair shaft. Research suggests it helps reduce protein loss when hair is washed, which is why it is a favourite for preventing dryness and breakage.</p>

      <h2>Almond oil</h2>
      <p>Light and naturally rich in vitamin E, almond oil softens and smooths hair, leaving it healthier and more manageable.</p>

      <h2>Hibiscus flower & rose leaves</h2>
      <p>Hibiscus is traditionally used to improve hair texture and softness, while rose leaves soothe the scalp and add a natural shine.</p>

      <h2>Ritha (soapnut)</h2>
      <p>Ritha contains natural saponins, gentle cleansers that help keep the scalp fresh and add volume and bounce.</p>

      <h2>Which oil is right for you?</h2>
      <div class="table-wrap">
        <table>
          <thead><tr><th>If your main concern is…</th><th>Choose</th></tr></thead>
          <tbody>
            <tr><td>Hair fall, weak or thinning-looking hair</td><td><strong>Anti Hair Fall Oil</strong>, with castor, amla and ritha</td></tr>
            <tr><td>Dryness, dullness, frizz or everyday nourishment</td><td><strong>Hair Care Oil</strong>, with coconut, castor, amla, almond, hibiscus and rose</td></tr>
          </tbody>
        </table>
      </div>

      <p class="note">Everyone's hair is different and results vary with regular use. For external use only.</p>
    `
  },
  {
    slug: 'mustard-oil-desi-kitchen',
    topic: 'kitchen',
    title: "Mustard Oil: Why It's a Desi Kitchen Essential",
    excerpt:
      'Bold aroma, authentic taste and made for high-heat cooking. Here is why mustard oil has been a kitchen staple for generations.',
    cover: 'assets/images/journal/mustard-oil-desi-kitchen.webp',
    coverAlt: 'A bottle of Esha Naturals Mustard Cooking Oil in warm light',
    products: ['mustard-oil'],
    body: `
      <p class="lead">Few aromas say "home cooking" like sarson ka tel sizzling in a pan. Mustard oil has been at the heart of desi kitchens for generations, and it still earns its place today.</p>

      <h2>What makes mustard oil special?</h2>
      <ul>
        <li><strong>Bold, authentic flavour.</strong> Its sharp, pungent aroma comes from natural compounds in mustard seeds and gives dishes their traditional taste.</li>
        <li><strong>Natural goodness.</strong> It is rich in monounsaturated fats and also contains omega-3 (alpha-linolenic acid), which is uncommon among cooking oils.</li>
        <li><strong>Natural & unrefined.</strong> Esha Naturals Mustard Oil keeps the rich aroma and character that refined oils lose.</li>
      </ul>

      <h2>Best ways to use it</h2>
      <ul>
        <li><strong>Tadka:</strong> bloom cumin, mustard seeds and curry leaves for daal and sabzi.</li>
        <li><strong>Frying:</strong> pakoras, fish and aloo, crisp and full of flavour.</li>
        <li><strong>Achar:</strong> the classic base for homemade pickles.</li>
        <li><strong>Saag & curries:</strong> nothing beats sarson ka saag made the traditional way.</li>
        <li><strong>Marinades:</strong> a spoonful adds depth to tikka and fish marinades.</li>
      </ul>

      <blockquote>Kitchen tip: heat mustard oil well before adding your spices. It mellows the sharpness and brings out its warm, nutty aroma.</blockquote>

      <h2>Storing it right</h2>
      <p>Keep the bottle tightly capped in a cool, dark cupboard away from the stove and sunlight. Avoid reusing frying oil again and again. Fresh oil tastes better and is better for you.</p>

      <p class="note">Oils rich in unsaturated fats are a better everyday choice than solid fats, but all oils are high in calories, so enjoy them in moderation as part of a balanced diet.</p>
    `
  },
  {
    slug: 'sesame-oil-benefits',
    topic: 'kitchen',
    title: 'Sesame Oil: Benefits & Best Uses in Everyday Cooking',
    excerpt: 'Til ka tel brings a gentle nutty aroma and natural antioxidants to your cooking. Here is how to make the most of it.',
    cover: 'assets/images/journal/sesame-oil-benefits.webp',
    coverAlt: 'A wooden bowl of sesame seeds beside Esha Naturals Sesame Oil',
    products: ['sesame-oil'],
    body: `
      <p class="lead">Sesame is one of the oldest oilseeds known to people, and its oil, til ka tel, has been prized in kitchens for centuries. It is pure, versatile and gently nutty.</p>

      <h2>The natural goodness of sesame</h2>
      <ul>
        <li><strong>Natural antioxidants:</strong> sesame naturally contains compounds such as sesamin and sesamolin, along with vitamin E. They also help keep the oil stable and fresh.</li>
        <li><strong>A balanced mix of fats:</strong> it is rich in both monounsaturated and polyunsaturated fats.</li>
        <li><strong>Pure and simple:</strong> Esha Naturals Sesame Oil is prepared from quality sesame seeds, nothing more.</li>
      </ul>

      <h2>How to use sesame oil</h2>
      <ul>
        <li><strong>Everyday cooking:</strong> sauté vegetables, cook sabzi and prepare curries.</li>
        <li><strong>Stir-fries & fried rice:</strong> it brings a delicious, gentle aroma.</li>
        <li><strong>Tadka:</strong> temper daal with garlic, cumin and red chilli.</li>
        <li><strong>Finishing drizzle:</strong> a few drops over salads, chutneys or noodles.</li>
        <li><strong>Traditional recipes:</strong> the taste your family remembers.</li>
      </ul>

      <blockquote>A little goes a long way. Its aroma means you can use less oil and still get more flavour.</blockquote>

      <h2>Keep it fresh</h2>
      <p>Store sesame oil in a cool, dark place, cap it tightly after use and keep it away from the stove. Fresh sesame oil smells mild and nutty. If it ever smells sharp or stale, it is time for a new bottle.</p>

      <p class="note">Enjoy all cooking oils in moderation as part of a balanced diet.</p>
    `
  },
  {
    slug: 'mustard-vs-sesame',
    topic: 'kitchen',
    title: 'Mustard or Sesame? Choosing the Right Oil for Every Dish',
    excerpt:
      'Both are pure, natural and full of flavour, but each shines in different dishes. Use this simple guide to pick the right one.',
    cover: 'assets/images/journal/mustard-vs-sesame.webp',
    coverAlt: 'Esha Naturals Mustard Oil and Sesame Oil side by side',
    products: ['mustard-oil', 'sesame-oil'],
    body: `
      <p class="lead">Keeping two good oils in your kitchen gives you more flavour, more variety and more balance. Here is a quick guide to when to reach for each.</p>

      <div class="table-wrap">
        <table>
          <thead><tr><th></th><th>Mustard Oil</th><th>Sesame Oil</th></tr></thead>
          <tbody>
            <tr><td>Flavour & aroma</td><td>Bold, sharp, traditional</td><td>Mild, gentle and nutty</td></tr>
            <tr><td>Best for</td><td>Tadka, deep-frying, achar, fish, saag</td><td>Sautéing, stir-fries, daal, dressings</td></tr>
            <tr><td>Cooking heat</td><td>High-heat cooking</td><td>Everyday medium–high heat</td></tr>
            <tr><td>Signature use</td><td>Homemade achar & sarson ka saag</td><td>Finishing drizzle & stir-fries</td></tr>
          </tbody>
        </table>
      </div>

      <h2>Why keep both?</h2>
      <p>Different oils bring different flavours, and different kinds of natural fats. Rotating between mustard and sesame oil keeps your cooking interesting and your diet more varied.</p>

      <h2>A simple rule of thumb</h2>
      <ul>
        <li>Want <strong>bold, desi flavour</strong> or crisp frying? Choose <strong>mustard oil</strong>.</li>
        <li>Want a <strong>lighter, nutty touch</strong> or a finishing drizzle? Choose <strong>sesame oil</strong>.</li>
      </ul>

      <blockquote>Store both tightly capped in a cool, dark cupboard, and never keep oil next to the stove.</blockquote>

      <p class="note">All oils are calorie-dense. Use them in moderation as part of a balanced diet.</p>
    `
  }
];

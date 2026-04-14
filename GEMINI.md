# CYPHER E-Commerce Store

## Design Context

### Users
Tech enthusiasts and early adopters shopping for the latest electronics — smartphones, laptops, and accessories. They visit CYPHER to discover new products, compare specs, find deals, and make confident purchase decisions. They are knowledgeable about tech, value quality and innovation, and expect a shopping experience that matches the premium nature of the products they're buying.

### Brand Personality
**Modern, Trustworthy, Innovative**

- **Voice**: Confident, knowledgeable, forward-thinking
- **Tone**: Professional yet approachable — speaks the language of tech without being intimidating
- **Emotional Goals**: Evoke confidence in purchase decisions, excitement about new technology, and trust in the platform

### Aesthetic Direction
- **Visual Tone**: Clean, modern, next-generation electronics retail experience
- **References**: Modern e-commerce platforms with clean layouts and product-focused design
- **Anti-References**: Cluttered layouts (old eBay), overly minimal/empty feeling, neon/garish colors, generic template looks
- **Theme**: Light mode only — focus on a polished, bright, professional light theme
- **Color Palette**:
  - Primary Blue: `#0070dc` — trust, technology, action
  - Primary Cyan: `#00b8db` — innovation, freshness, links/hovers
  - Primary Yellow: `#facc15` — deals, highlights, urgency
  - Dark Navy: `#041e42` — premium depth, CTAs, text
  - Icon Gray: `#99a1af` — secondary elements, muted states
- **Typography**: Roboto — clean, modern, highly legible for specs and product details
- **Spacing**: Generous whitespace, breathable layouts, clear visual hierarchy
- **Animation**: Subtle, purposeful Framer Motion transitions — smooth but not distracting

### Design Principles

1. **Product-First**: Every design decision should showcase products beautifully. Images, specs, and pricing are the heroes — UI should frame them, not compete with them.

2. **Confident Clarity**: Tech buyers need clear information presented confidently. Specs, prices, ratings, and availability should be instantly scannable and unambiguous.

3. **Modern Restraint**: Clean and contemporary without feeling sterile or empty. Use whitespace intentionally, maintain visual density that feels rich but not cluttered, and let the products provide visual interest.

4. **Trust Through Polish**: Every interaction should feel refined and professional. Smooth transitions, consistent spacing, and attention to detail signal that this is a trustworthy place to spend money on premium electronics.

5. **Progressive Disclosure**: Present information in layers. Show what matters first (product image, name, price, rating), then reveal more detail on interaction (specs, reviews, comparisons). Respect the user's attention and cognitive load.

---

## Tech Stack

- **Next.js 16** with App Router
- **React 19**
- **Tailwind CSS 4**
- **Framer Motion** for animations
- **Zustand** for state management
- **Clerk** for authentication
- **Stripe** for payments
- **Swiper** for carousels
- **Sonner** for toast notifications
- **TypeScript**

## Design Tokens

### Colors
```css
--primary-blue: #0070dc;    /* Primary actions, brand */
--primary: #00b8db;         /* Links, hovers, accents */
--primary-yellow: #facc15;  /* Deals, highlights, badges */
--dark-btn: #041e42;        /* Dark CTAs, headings */
--icon-color: #99a1af;      /* Secondary icons, muted text */
```

### Typography
- **Font Family**: Roboto (Google Fonts)
- **Usage**: All text — headings, body, UI elements

### Layout
- **Container**: `c-container` — responsive width (85% xl, 90% lg, full with padding on mobile)
- **Grid**: Responsive product grids (3 cols → 2 cols → 1 col)
- **Border Radius**: `rounded-md` as standard, `rounded-full` for pills/buttons

### Animation
- **Library**: Framer Motion
- **Principles**: Smooth, purposeful, never gratuitous
- **Duration**: 200-300ms for micro-interactions, 400-600ms for page transitions

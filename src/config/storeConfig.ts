export interface ProductFeature {
  id: string;
  title: string;
  description: string;
  confirmedByOwner: boolean;
  category: 'organization' | 'dimensions' | 'materials' | 'portability';
}

export interface CapacityItem {
  item: string;
  quantity: string;
  note: string;
}

export interface FAQItem {
  id: string;
  question: string;
  answer: string;
  isConfirmed: boolean;
  placeholderNotice?: string;
}

export interface StoreConfig {
  brand: {
    name: string;
    tagline: string;
    announcement: string;
    announcementSubtext?: string;
    showAnnouncement: boolean;
  };
  product: {
    id: string;
    sku: string;
    title: string;
    subtitle: string;
    defaultRetailPrice: number | null; // Set by store owner (not supplier cost). Set to null to test unconfigured state
    currency: string;
    currencySymbol: string;
    variantName: string;
    variantDescription: string;
    inStock: boolean;
    stockNotice: string;
    primaryImage: string;
    gallery: Array<{
      id: string;
      src: string;
      alt: string;
      label: string;
    }>;
    dimensions: {
      lengthInches: number;
      widthInches: number;
      heightInches: number;
      unit: string;
      displayString: string;
      disclaimer: string;
    };
    capacity: {
      headline: string;
      subheadline: string;
      items: CapacityItem[];
      disclaimer: string;
    };
    verifiedFeatures: ProductFeature[];
    unconfirmedClaims: ProductFeature[];
  };
  reviews: {
    enabled: boolean;
    items: Array<{
      id: string;
      author: string;
      rating: number;
      date: string;
      comment: string;
      verified: boolean;
    }>;
    emptyStateMessage: string;
    emptyStateSubtext: string;
  };
  faqs: FAQItem[];
  policies: {
    shipping: {
      headline: string;
      status: 'pending_confirmation' | 'active';
      text: string;
      placeholderNotice: string;
    };
    returns: {
      headline: string;
      status: 'pending_confirmation' | 'active';
      text: string;
      placeholderNotice: string;
    };
    care: {
      headline: string;
      status: 'pending_confirmation' | 'active';
      text: string;
      placeholderNotice: string;
    };
    privacy: {
      headline: string;
      text: string;
    };
    terms: {
      headline: string;
      text: string;
    };
  };
  contact: {
    supportEmail: string;
    businessHours: string;
    location: string;
  };
}

export const storeConfig: StoreConfig = {
  brand: {
    name: "Serein",
    tagline: "Thoughtful packing, calm journeys",
    announcement: "Editable working announcement bar — Customize your seasonal message or launch note here.",
    showAnnouncement: true,
  },
  product: {
    id: "serein-organizer-01",
    sku: "SR-ORG-BLK-01",
    title: "The Double-Layer Travel Organizer",
    subtitle: "A dual-tier packing organizer engineered to keep undergarments, delicates, and travel accessories structured and separated without suitcase clutter.",
    
    // Store owner-configured retail price (never displays supplier $15.78 cost).
    // Can be edited or set to null to test unconfigured price warning.
    defaultRetailPrice: 38.00,
    currency: "USD",
    currencySymbol: "$",
    
    variantName: "Double Layer Black",
    variantDescription: "Deep charcoal matte outer with blush satin interior accents and durable silver-tone dual zippers.",
    inStock: true,
    stockNotice: "Available in limited initial production batches.",

    // Primary product photography - Studio high-resolution commercial photography
    primaryImage: "/images/product-organizer-open-bra.jpg",
    gallery: [
      {
        id: "img-open-bra",
        src: "/images/product-organizer-open-bra.jpg",
        alt: "The Double-Layer Travel Organizer open showing structured bra support tier and top mesh pockets",
        label: "Dual-Tier Organization"
      },
      {
        id: "img-hero",
        src: "/images/product-organizer-hero.jpg",
        alt: "The Double-Layer Travel Organizer by Serein in structured dual-tier configuration",
        label: "Exterior Structure"
      },
      {
        id: "img-packed",
        src: "/images/product-organizer-packed.jpg",
        alt: "The Double-Layer Travel Organizer open with roll-packed apparel and top lid mesh pockets",
        label: "Packed Apparel"
      },
      {
        id: "img-closed",
        src: "/images/product-organizer-closed.jpg",
        alt: "The Double-Layer Travel Organizer top angle highlighting the soft webbing handle and durable finish",
        label: "Compact Profile"
      }
    ],

    dimensions: {
      lengthInches: 15,
      widthInches: 5.9,
      heightInches: 10.2,
      unit: "inches",
      displayString: "15 × 5.9 × 10.2 in (38.1 × 15.0 × 25.9 cm)",
      disclaimer: "Listed dimensions represent external measurements under normal expansion. Dimensions may vary slightly depending on packing fullness."
    },

    capacity: {
      headline: "Approximate packing volume",
      subheadline: "Based on supplier manufacturer estimates for a typical 5–7 day journey. Exact packing capacity varies by individual garment size, fabric bulk, and packing technique.",
      items: [
        {
          item: "Bra & panty sets",
          quantity: "~5 sets",
          note: "Structured cups store flat without crushing"
        },
        {
          item: "Pairs of socks",
          quantity: "~5 pairs",
          note: "Folds neatly into top mesh sleeves"
        },
        {
          item: "Swimwear",
          quantity: "1 swimsuit",
          note: "Lower tier or elastic slip pocket"
        },
        {
          item: "Sleepwear",
          quantity: "1 lightweight set",
          note: "Accommodates silk or cotton sleepwear"
        }
      ],
      disclaimer: "Important note: Capacity figures are approximate guidelines provided for packing estimation and depend on your clothing thickness and cup dimensions."
    },

    // Verified features extracted directly from confirmed physical attributes
    verifiedFeatures: [
      {
        id: "feat-dual-layer",
        title: "Dual-Tier Dedicated Compartments",
        description: "Two distinct zippered tiers allow you to separate undergarments from everyday luggage, preserving privacy and hygiene.",
        confirmedByOwner: true,
        category: "organization"
      },
      {
        id: "feat-mesh-pockets",
        title: "Flexible Mesh Organization",
        description: "Multiple elasticized mesh pockets keep socks, delicates, and small travel accessories visible and securely in place.",
        confirmedByOwner: true,
        category: "organization"
      },
      {
        id: "feat-compression-zip",
        title: "Perimeter Compression Zipper",
        description: "Expand to pack for a full week, or engage the compression zipper when traveling lighter to minimize luggage footprint.",
        confirmedByOwner: true,
        category: "dimensions"
      },
      {
        id: "feat-soft-handle",
        title: "Soft Carry Grab Handle",
        description: "Ergonomic top carry handle provides effortless extraction from carry-ons, totes, or hotel closet shelving.",
        confirmedByOwner: true,
        category: "portability"
      }
    ],

    // Unconfirmed supplier claims explicitly held pending store owner verification
    unconfirmedClaims: [
      {
        id: "claim-water-resistance",
        title: "Water-Resistant Outer Finish",
        description: "Supplier listing mentions water-resistant polyester treatment. (Pending store owner material test confirmation before official publication).",
        confirmedByOwner: false,
        category: "materials"
      },
      {
        id: "claim-machine-washable",
        title: "Machine Washable & Fade-Resistant",
        description: "Supplier listing suggests machine washability. (Care instructions currently unverified; spot-clean recommended until confirmed).",
        confirmedByOwner: false,
        category: "materials"
      }
    ]
  },

  // No fake reviews: Neutral placeholder until real customer reviews exist
  reviews: {
    enabled: true,
    items: [], // Zero invented reviews
    emptyStateMessage: "No customer reviews yet",
    emptyStateSubtext: "Serein collects verified reviews only from confirmed purchases. Once customer orders are delivered, authentic feedback will appear here."
  },

  faqs: [
    {
      id: "faq-capacity",
      question: "What fits inside The Double-Layer Travel Organizer?",
      answer: "The organizer is designed for a typical 5–7 day journey, approximately holding up to 5 bra-and-panty sets, 5 pairs of socks, 1 swimsuit, and lightweight pajamas. Actual capacity varies by personal garment dimensions and fold style.",
      isConfirmed: true
    },
    {
      id: "faq-dimensions",
      question: "What are the exact dimensions?",
      answer: "External measurements are approximately 15 × 5.9 × 10.2 inches (38.1 × 15.0 × 25.9 cm). It fits comfortably in standard carry-on suitcases, weekender duffels, and backpacks.",
      isConfirmed: true
    },
    {
      id: "faq-compression",
      question: "How does the compression zipper work?",
      answer: "The bag features an expandable gusset controlled by a sturdy perimeter zipper. Pack your items, zip the main closure, then gently compress the outer ring zipper to squeeze out excess air and reduce vertical volume.",
      isConfirmed: true
    },
    {
      id: "faq-care",
      question: "How should I clean and care for this organizer?",
      answer: "[Store Owner Confirmation Needed] Supplier notes mention machine washability, but until official care testing is verified, we recommend gentle spot cleaning with a damp microfiber cloth and mild soap. Air dry flat away from direct heat.",
      isConfirmed: false,
      placeholderNotice: "Awaiting store owner fabric testing & care label confirmation."
    },
    {
      id: "faq-shipping",
      question: "What are your shipping rates and estimated delivery times?",
      answer: "[Store Owner Confirmation Needed] Shipping carriers and delivery tiers are configured in your backend checkout. Exact transit times and carrier options will display at checkout once your live shipping profile is finalized.",
      isConfirmed: false,
      placeholderNotice: "Awaiting store owner shipping rates & carrier policy setup."
    },
    {
      id: "faq-returns",
      question: "What is your return and exchange policy?",
      answer: "[Store Owner Confirmation Needed] Standard return window and eligibility conditions are currently pending store owner policy confirmation. An editable return agreement can be configured in store settings.",
      isConfirmed: false,
      placeholderNotice: "Awaiting store owner return window & conditions policy."
    }
  ],

  policies: {
    shipping: {
      headline: "Shipping Policy",
      status: "pending_confirmation",
      text: "Shipping methods, transit windows, and applicable carrier fees are calculated directly from backend carrier profiles. We do not make unverified delivery promises before shipping configuration is confirmed by the store owner.",
      placeholderNotice: "Store owner action required: Configure carrier rules and delivery zones in server commerce settings."
    },
    returns: {
      headline: "Returns & Exchanges",
      status: "pending_confirmation",
      text: "Our return framework supports hassle-free exchanges and returns for unused items with original tags. Specific return timeframes (e.g. 14, 30, or 60 days) and return postage policies must be formally designated by the store owner.",
      placeholderNotice: "Store owner action required: Define return eligibility window and RMA process."
    },
    care: {
      headline: "Care & Material Verification",
      status: "pending_confirmation",
      text: "The supplier listing states the item is lightweight water-resistant polyester and machine washable. In accordance with honest consumer standards, we advise delicate spot-cleaning until wash laboratory tests are verified.",
      placeholderNotice: "Store owner action required: Confirm fabric composition and garment care specifications."
    },
    privacy: {
      headline: "Privacy Policy",
      text: "Serein respects your privacy. We process customer names, shipping addresses, and emails strictly to fulfill orders and provide tracking updates. We never sell customer data to third parties. All payment processing is securely handled via encrypted payment gateway sessions; we never see or store full credit card numbers on our servers."
    },
    terms: {
      headline: "Terms of Service",
      text: "By ordering from Serein, you agree to our standard terms of purchase. Product prices and availability are determined by live backend configuration. Orders are subject to inventory verification and fraud screening before fulfillment."
    }
  },

  contact: {
    supportEmail: "concierge@serein.com",
    businessHours: "Monday – Friday, 9am – 5pm EST",
    location: "United States (Fulfillment & Support)"
  }
};

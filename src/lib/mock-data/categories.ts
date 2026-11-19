import { Category } from "@/types";

export const initialCategories: Category[] = [
  {
    id: "cat_001",
    name: "Mobiles & Electronics",
    slug: "mobiles-electronics",
    icon: "Smartphone",
    listingCount: 4210,
    reelsCount: 7890,
    isActive: true,
    subcategories: [
      {
        id: "sub_101",
        name: "Smartphones",
        slug: "smartphones",
        listingCount: 2310,
        attributes: [
          { id: "attr_1", name: "Brand", type: "select", required: true, options: ["Apple", "Samsung", "OnePlus", "Xiaomi", "Vivo", "Realme"] },
          { id: "attr_2", name: "Storage", type: "select", required: true, options: ["64GB", "128GB", "256GB", "512GB", "1TB"] },
          { id: "attr_3", name: "Battery Health (%)", type: "number", required: false },
          { id: "attr_4", name: "Original Bill & Box Included", type: "boolean", required: true },
        ],
      },
      {
        id: "sub_102",
        name: "Laptops & Computers",
        slug: "laptops-computers",
        listingCount: 1140,
        attributes: [
          { id: "attr_5", name: "Processor", type: "text", required: true },
          { id: "attr_6", name: "RAM (GB)", type: "select", required: true, options: ["8GB", "16GB", "32GB", "64GB"] },
          { id: "attr_7", name: "SSD Capacity", type: "select", required: true, options: ["256GB", "512GB", "1TB", "2TB"] },
        ],
      },
      {
        id: "sub_103",
        name: "Gaming Consoles",
        slug: "gaming-consoles",
        listingCount: 420,
        attributes: [
          { id: "attr_8", name: "Console Platform", type: "select", required: true, options: ["PlayStation 5", "PlayStation 4", "Xbox Series X", "Nintendo Switch"] },
          { id: "attr_9", name: "Controllers Included", type: "number", required: true },
        ],
      },
    ],
  },
  {
    id: "cat_002",
    name: "Vehicles & Auto",
    slug: "vehicles-auto",
    icon: "Car",
    listingCount: 3120,
    reelsCount: 5420,
    isActive: true,
    subcategories: [
      {
        id: "sub_201",
        name: "Motorcycles & Scooters",
        slug: "motorcycles-scooters",
        listingCount: 1890,
        attributes: [
          { id: "attr_10", name: "Registration Year", type: "number", required: true },
          { id: "attr_11", name: "Kilometers Driven", type: "number", required: true },
          { id: "attr_12", name: "Number of Owners", type: "select", required: true, options: ["1st Owner", "2nd Owner", "3rd+ Owner"] },
          { id: "attr_13", name: "Insurance Valid", type: "boolean", required: true },
        ],
      },
      {
        id: "sub_202",
        name: "Cars & SUVs",
        slug: "cars-suvs",
        listingCount: 1230,
        attributes: [
          { id: "attr_14", name: "Fuel Type", type: "select", required: true, options: ["Petrol", "Diesel", "CNG", "Electric", "Hybrid"] },
          { id: "attr_15", name: "Transmission", type: "select", required: true, options: ["Manual", "Automatic"] },
          { id: "attr_16", name: "RTO City Code", type: "text", required: true },
        ],
      },
    ],
  },
  {
    id: "cat_003",
    name: "Fashion & Handlooms",
    slug: "fashion-handlooms",
    icon: "Shirt",
    listingCount: 5680,
    reelsCount: 12400,
    isActive: true,
    subcategories: [
      {
        id: "sub_301",
        name: "Traditional Wear & Sarees",
        slug: "traditional-wear",
        listingCount: 3420,
        attributes: [
          { id: "attr_17", name: "Weave Style", type: "select", required: true, options: ["Kanjeevaram", "Banarasi", "Chanderi", "Paithani", "Tussar Silk"] },
          { id: "attr_18", name: "Silk Mark Certified", type: "boolean", required: false },
        ],
      },
      {
        id: "sub_302",
        name: "Designer Kurtas & Lehengas",
        slug: "designer-lehengas",
        listingCount: 2260,
        attributes: [
          { id: "attr_19", name: "Size", type: "select", required: true, options: ["XS", "S", "M", "L", "XL", "XXL", "Free Size"] },
          { id: "attr_20", name: "Occasion", type: "select", required: true, options: ["Bridal", "Festive", "Party Wear", "Casual"] },
        ],
      },
    ],
  },
  {
    id: "cat_004",
    name: "Real Estate & Spaces",
    slug: "real-estate",
    icon: "Building2",
    listingCount: 1840,
    reelsCount: 3910,
    isActive: true,
    subcategories: [
      {
        id: "sub_401",
        name: "Apartments & Flats",
        slug: "apartments-flats",
        listingCount: 1120,
        attributes: [
          { id: "attr_21", name: "Bedrooms (BHK)", type: "select", required: true, options: ["1 BHK", "2 BHK", "3 BHK", "4+ BHK", "Studio"] },
          { id: "attr_22", name: "Super Built-up Area (Sq.Ft)", type: "number", required: true },
          { id: "attr_23", name: "RERA Registered", type: "boolean", required: true },
        ],
      },
      {
        id: "sub_402",
        name: "Commercial Spaces & Shops",
        slug: "commercial-spaces",
        listingCount: 720,
        attributes: [
          { id: "attr_24", name: "Property Type", type: "select", required: true, options: ["Shop", "Office", "Warehouse", "Showroom"] },
        ],
      },
    ],
  },
  {
    id: "cat_005",
    name: "Home & Decor",
    slug: "home-decor",
    icon: "Armchair",
    listingCount: 2890,
    reelsCount: 4670,
    isActive: true,
    subcategories: [
      {
        id: "sub_501",
        name: "Solid Wood Furniture",
        slug: "solid-wood-furniture",
        listingCount: 1640,
        attributes: [
          { id: "attr_25", name: "Wood Type", type: "select", required: true, options: ["Sheesham", "Teak Wood", "Mango Wood", "Acacia"] },
        ],
      },
    ],
  },
];

import fs from "node:fs";
import path from "node:path";
import { createClient } from "@supabase/supabase-js";
import Papa from "papaparse";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const filePath = process.env.PRODUCTS_CSV_PATH || path.join(process.cwd(), "public", "products.csv.csv");

if (!supabaseUrl || !supabaseKey) {
  throw new Error("Missing Supabase env vars. Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.");
}

const supabase = createClient(supabaseUrl, supabaseKey);

function parseNumber(value, fallback = 0) {
  const parsed = Number.parseFloat(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

async function importData() {
  try {
    if (!fs.existsSync(filePath)) {
      console.error(`File not found: ${filePath}`);
      return;
    }

    const csvFile = fs.readFileSync(filePath, "utf8");
    console.log("CSV file loaded. Processing import...");

    Papa.parse(csvFile, {
      header: true,
      skipEmptyLines: true,
      complete: async (results) => {
        const rows = Array.isArray(results.data) ? results.data : [];
        const productsMap = new Map();

        console.log(`Found ${rows.length} rows. Preparing unique products...`);

        for (const row of rows) {
          if (row.Title && row.Handle) {
            productsMap.set(row.Handle, {
              handle: row.Handle,
              title: row.Title,
              description: row["Body (HTML)"],
              vendor: row.Vendor,
              category: row["Product Category"],
              product_type: row.Type,
              tags: row.Tags ? row.Tags.split(",").map((tag) => tag.trim()) : [],
              main_image: row["Image Src"],
            });
          }
        }

        const uniqueProducts = Array.from(productsMap.values());

        if (!uniqueProducts.length) {
          console.error("No valid products found in CSV.");
          return;
        }

        const { data: insertedProducts, error: productError } = await supabase
          .from("products")
          .upsert(uniqueProducts, { onConflict: "handle" })
          .select();

        if (productError) {
          console.error("Product import failed:", productError.message);
          return;
        }

        console.log(`Imported or updated ${insertedProducts.length} products.`);

        const idMap = {};
        insertedProducts.forEach((product) => {
          idMap[product.handle] = product.id;
        });

        const variantsToInsert = [];
        const imagesToInsert = [];

        for (const row of rows) {
          const productId = idMap[row.Handle];

          if (!productId) {
            continue;
          }

          if (row["Variant SKU"]) {
            variantsToInsert.push({
              product_id: productId,
              sku: row["Variant SKU"],
              option1_name: row["Option1 Name"],
              option1_value: row["Option1 Value"],
              price_selling: parseNumber(row["Variant Price"]),
              price_compare: parseNumber(row["Variant Compare At Price"]),
              barcode: row["Variant Barcode"],
              weight_grams: parseNumber(row["Variant Grams"]),
            });
          }

          if (row["Image Src"]) {
            imagesToInsert.push({
              product_id: productId,
              src: row["Image Src"],
              position: Number.parseInt(row["Image Position"], 10) || 1,
            });
          }
        }

        if (variantsToInsert.length) {
          const { error: variantError } = await supabase.from("variants").upsert(variantsToInsert);

          if (variantError) {
            console.error("Variant import failed:", variantError.message);
          } else {
            console.log(`Imported ${variantsToInsert.length} variants.`);
          }
        }

        if (imagesToInsert.length) {
          const { error: imageError } = await supabase.from("product_images").upsert(imagesToInsert);

          if (imageError) {
            console.error("Image import failed:", imageError.message);
          } else {
            console.log(`Imported ${imagesToInsert.length} images.`);
          }
        }

        console.log("Import complete.");
      },
      error: (error) => {
        console.error("CSV parsing failed:", error.message);
      },
    });
  } catch (error) {
    console.error("Import script failed:", error.message);
  }
}

importData();

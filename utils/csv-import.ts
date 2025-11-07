//36980 rows
// import_data.ts
import * as fs from "fs";
import * as path from "path";
import Papa from "papaparse";
import prisma from "../lib/prisma";
// --- CONFIGURATION ---
const CSV_FILE_PATH = path.join(process.cwd(), "cross-verified-database.csv");
const BATCH_SIZE = 5000; // Optimal batch size for efficient inserts

// --- PRISMA CLIENT ---

interface CsvRow {
  // Define a generic shape for the CSV data.
  // The actual keys here must match your CSV header names exactly.
  name: string;
  wikidata_code: string;
  occupations: string;
  image_url: string;
  created_at: string;
  level2_main_occ: string;
  level3_main_occ: string;
  birth_estimation: number;
}

async function importData() {
  console.log("--- Starting Data Import with PapaParse and Prisma ---");

  // Optional: Clear the table before import (uncomment if re-running)
  // await prisma.notablePerson.deleteMany({});
  // console.log(`Cleared existing data from NotablePerson table.`);

  let totalRows = 0;
  let batch: CsvRow[] = [];

  const stream = fs.createReadStream(CSV_FILE_PATH, { encoding: "utf8" });

  // 1. Use PapaParse's stream parsing for low memory consumption
  const parser = Papa.parse<CsvRow>(stream, {
    header: true,
    skipEmptyLines: true,
    chunk: async (results, parser) => {
      // 2. Pause the stream while processing the chunk
      parser.pause();

      batch.push(...results.data);
      totalRows += results.data.length;

      // 3. When the batch size is reached, execute the transaction
      if (batch.length >= BATCH_SIZE) {
        await executeBatch(batch);
        console.log(
          `\u2705 Successfully inserted ${batch.length} rows. Total: ${totalRows}`
        );
        batch = [];
      }

      // 4. Resume the stream to fetch the next chunk
      parser.resume();
    },
    error: (err) => {
      console.error("PapaParse Stream Error:", err.message);
      stream.destroy(); // Stop the entire process on error
    },
    complete: async () => {
      // 5. Handle the final, remaining batch
      if (batch.length > 0) {
        await executeBatch(batch);
        totalRows += batch.length;
        console.log(`\u2705 Successfully inserted final ${batch.length} rows.`);
      }

      console.log(
        `\n\uD83C\uDFC1 Import Complete! Total records inserted: ${totalRows}`
      );
      await prisma.$disconnect();
    },
  });
}

/**
 * Inserts a batch of rows using Prisma's createMany for high performance.
 * @param data The array of CSV rows to insert.
 */
const excluded_occupations = new Set([
  "politician",
  "diplomat",
  "unknown",
  "miscellaneous",
  "economist",
  "historian",
  "teacher",
  "journalist",
  "cinematographer",
  "academic",
  "film director",
  "film producer",
  "screenwriter",
  "American football",
  "physician",
  "basketball",
  "swimmer",
  "volleyball",
  "baseball",
  "rugby",
  "fighter",
  "hockey",
  "photographer",
  "military personnel",
  "engineer",
  "promoter",
  "writer",
  "poet",
  "composer",
  "conductor",
  "architect",
  "cartoonist",
  "illustrator",
  "playwright",
  "biologist",
  "chemist",
  "physicist",
  "mathematician",
  "geologist",
  "astronomer",
  "linguist",
  "philosopher",
  "psychologist",
  "sociologist",
  "anthropologist",
  "archaeologist",
  "theologian",
  "historian",
  "judge",
  "lawyer",
  "activist",
  "social reformer",
  "professor",
  "botschafter",
  "évêque",
  "dichter",
  "philosophe",
  "clarinet",
  "astronomer",
  "geologist",
  "linguist",
  "priest",
  "dancer",
  "publisher",
  "threatre",
  "pianist",
  "golf",
  "ginasta",
  "opera",
  "monk",
  "botanist",
  "militant",
  "salor",
  "presenter",
  "choreographer",
  "hacker",
  "earl",
  "palaeontologist",
  "theologian",
  "architect",
  "aerospace",
  "basket",
  "racer",
  "skater",
  "curler",
  "manga",
  "officer",
  "literary",
  "presbyter",
  "throne",
  "driver",
  "archaeologist",
  "organbuilder",
  "editor",
  "sculptor",
  "translator",
  "geographer",
  "cartographer",
  "numismatist",
  "philatelist",
  "antiquarian",
  "heraldist",
  "boxer",
  "chess",
  "psychiatrist",
  "medievalist",
  "ambassadeur",
  "biochemist",
  "criminologist",
  "cartographer",
  "heraldist",
  "numismatist",
  "philatelist",
  "bandleader",
  "trumpet",
  "militar",
  "political_scientist",
  "karate",
  "painter",
  "deputy",
  "jumper",
  "art_historian",
  "heir",
  "mineralogist",
  "oberst",
  "violin",
  "diver",
  "manager",
  "civil_rights",
  "world_war",
  "curator",
  "merchant",
  "ski",
  "coptologist",
  "physiotherapist",
  "weightlifter",
  "ethnologist",
  "designer",
  "mountaineer",
  "novelist",
  "piano",
  "bodybuilder",
  "supercentenári",
  "widerstand",
  "nazi",
  "organist",
  "librarian",
  "skier",
  "animatrice",
  "wife_of",
  "esperantist",
  "opfer",
  "germanist",
  "archaeology",
  "canoe",
  "radiologist",
  "seiyū",
  "grafiker",
  "resistance",
  "research",
  "neuroscientist",
  "vaccine",
  "saxophonist",
  "go_player",
  "katholischer",
  "joiner",
  "torturer",
  "paediatrician",
  "author",
  "abenteurer",
  "wissenschaftler",
  "puppeteer",
  "impresario",
  "philologist",
  "soldier",
  "vorsitzender",
  "photojournalist",
  "radio",
  "writer",
  "draughtswoman",
  "photojournalist",
  "photo",
  "world_war",
  "minister",
  "scientist",
  "queen",
  "racing",
  "criminal",
  "special_effects",
  "animator",
  "surgeon",
  "lieutenant",
  "producer",
  "archbishop",
  "bank",
  "rower",
  "bailiff",
  "erzbischof",
  "teatro",
  "engenheir",
  "civil_service",
  "nataçã",
  "prelate",
  "liedermacher",
  "judo",
  "tarento",
  "rikishi",
  "cellist",
  "trade_union",
  "javelin_thrower",
  "jockey",
  "explorer",
  "drug_traffick",
  "gymnast",
  "mountain_guide",
  "hijack",
  "hausfrau",
  "guitar",
  "badminton",
  "army",
  "theatre",
  "jeweller",
  "drummer",
  "mayor",
  "beauty_pageant",
  "business",
  "deacon",
  "prince",
  "bhikkhu",
  "costume_designer",
  "polo",
  "mobster",
  "badminton",
  "bandleader",
  "rapper",
  "commandant",
  "kommandeur",
  "supremacist",
  "astronaut",
  "paratrooper",
  "bassist",
  "parson",
  "fighter_pilot",
  "aristocrat",
  "nationalsozialismus",
  "comedian",
  "son",
  "collector",
  "countess",
  "clarinet",
  "zoologist",
  "king",
  "killer",
  "entrepreneur",
  "wrestler",
  "daughter",
  "theater",
  "clown",
  "coach",
  "waiter",
  "chief_executive",
  "rabbi",
  "commandant",
  "scholar",
  "kommandant",
  "club",
  "kayak",
  "paratrooper",
  "drummer",
  "legislative",
  "political",
  "athlete",
  "education",
  "missionary",
  "snowboard",
  "freestyle",
  "estudios",
  "atirador",
  "farmer",
  "rádio",
  "treinador",
  "apresentador",
  "produtor",
  "combatente",
  "demógraf",
  "deputad",
  "pastor",
  "olímpico",
  "precursor",
  "bishop",
  "apresentador",
  "engraver",
]);

const excluded_level2_occupations = new Set([
  "Politics",
  "Religious",
  "Culture-periphery",
  "Administration",
  "writer",
  "military personnel",
  "religious leader",
  "diplomat",
  "Nobility",
  "Culture-core",
  "Academia",
  "Family",
]);

async function executeBatch(data: CsvRow[]) {
  const records = data.map((row) => {
    if (row.birth_estimation < 1900) {
      console.warn(
        `\u26A0 Skipping row with birth estimation < 1900: ${row.name}`
      );
      return null; // Skip this row
    }
    if (
      row.level3_main_occ.includes("ian") ||
      row.level3_main_occ.includes("ist") ||
      row.level3_main_occ.includes("Missing")
    ) {
      console.warn(
        `\u26A0 Skipping row with level3 occupation containing 'ian': ${row.name}`
      );
      return null; // Skip this row
    }
    if (excluded_occupations.has(row.level3_main_occ.toLowerCase())) {
      console.warn(`\u26A0 Skipping row with excluded occupation: ${row.name}`);
      return null; // Skip this row
    }
    if (excluded_level2_occupations.has(row.level2_main_occ.toLowerCase())) {
      console.warn(
        `\u26A0 Skipping row with excluded level 2 occupation: ${row.name}`
      );
      return null; // Skip this row
    }

    return {
      // Map CSV data to the Prisma model fields
      name: row.name || "Unknown",
      wikidata_url: row.wikidata_code || "Unknown",
      occupation: row.level3_main_occ || "Unknown",
      image_url: row.image_url || "Unknown",
      created_at: row.created_at || new Date().toISOString(),
    };
  });

  try {
    const filteredRecords = records.filter(
      (record): record is NonNullable<typeof record> => record !== null
    );
    // 6. Use createMany for a single, efficient database query
    await prisma.notablePerson.createMany({
      data: filteredRecords,
      skipDuplicates: true, // Useful if the script is interrupted and re-run
    });
  } catch (e) {
    console.error(
      `\u274C Error inserting batch starting with: ${data[0]?.name}`,
      e
    );
  }
}

importData();

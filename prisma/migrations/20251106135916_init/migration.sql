-- CreateTable
CREATE TABLE "NotablePerson" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "wikidata_url" TEXT NOT NULL,
    "occupation_groups" TEXT NOT NULL,
    "occupations" TEXT NOT NULL,
    "image_url" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "NotablePerson_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "NotablePerson_wikidata_url_key" ON "NotablePerson"("wikidata_url");

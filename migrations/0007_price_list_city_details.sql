-- Contact details a city shares with its price lists (JSON: office address, site address,
-- phones, email, footer message, notes). Lists choose field by field to use them.
ALTER TABLE "PriceListCity" ADD COLUMN "details" TEXT;

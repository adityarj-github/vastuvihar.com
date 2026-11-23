-- Optional window in which a price list is shown (dates are YYYY-MM-DD in India time;
-- "until" includes that whole day). Null means no limit.
ALTER TABLE "PriceList" ADD COLUMN "activeFrom" TEXT;
ALTER TABLE "PriceList" ADD COLUMN "activeUntil" TEXT;

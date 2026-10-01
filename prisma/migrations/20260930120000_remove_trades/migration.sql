UPDATE "Listing" SET "status" = 'sold' WHERE "status" = 'traded';

DROP TABLE IF EXISTS "TradeOffer";

ALTER TABLE "Order" DROP COLUMN "tradeOfferId";

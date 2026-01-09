-- CreateTable
CREATE TABLE "_AssetToUser" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_AssetToUser_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "_AssetToUser_B_index" ON "_AssetToUser"("B");

-- AddForeignKey
ALTER TABLE "_AssetToUser" ADD CONSTRAINT "_AssetToUser_A_fkey" FOREIGN KEY ("A") REFERENCES "Asset"("symbol") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_AssetToUser" ADD CONSTRAINT "_AssetToUser_B_fkey" FOREIGN KEY ("B") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

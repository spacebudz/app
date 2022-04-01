import * as React from "react";
import { Button } from "../components";
import { MainLayout } from "../layouts/mainLayout";
import { addNetwork } from "../milkomeda/auctionCharles/contract";

const AuctionCharles = () => {
  return (
    <MainLayout title="SpaceBudz | Auction" titleTwitter="SpaceBudz: Auction">
      <div>
        <div>Auction SpaceBud #1421</div>
        <Button onClick={() => addNetwork()}>Connect</Button>
      </div>
    </MainLayout>
  );
};

export default AuctionCharles;

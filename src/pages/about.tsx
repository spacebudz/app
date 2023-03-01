import * as React from "react";
import { MainLayout } from "../layouts/mainLayout";

const TeamImage = "../images/team.jpg";

const About = () => {
  return (
    <MainLayout title="SpaceBudz | About" titleTwitter="SpaceBudz: About">
      <div className="w-full flex justify-center items-center mb-40">
        <div className="px-8 mt-4 md:mt-0 w-full max-w-2xl">
          <div className="font-bold text-primary text-3xl mb-16">About</div>
          <div className="w-full text-justify">
            SpaceBudz, founded by Zieg and Alessandro, was launched in March
            2021 on the Cardano blockchain. It quickly became a beloved project
            in the Cardano community, renowned for its groundbreaking work in
            NFTs. SpaceBudz was the first to mint an NFT collection, establish
            an NFT metadata standard, and launch a fully smart contract-based
            marketplace. The founders created SpaceBudz out of their curiosity
            and passion for Cardano and its technology. They are dedicated to
            open-source principles and believe in the power of decentralization.
            They aim to keep these values at the heart of the SpaceBudz project,
            ensuring that it remains true to its roots.
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default About;

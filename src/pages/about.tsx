import { StaticImage } from "gatsby-plugin-image";
import * as React from "react";
import { MainLayout } from "../layouts/mainLayout";

const TeamImage = "../images/team.jpg";

const About = () => {
  return (
    <MainLayout title="SpaceBudz | About" titleTwitter="SpaceBudz: About">
      <div className="w-full flex justify-center items-center mb-40">
        <div className="px-6 mt-4 md:mt-0 max-w-5xl w-full">
          <div className="font-bold text-primary text-3xl mb-16">About</div>
          <div className="w-full text-justify">
            SpaceBudz was launched in March of 2021 on the Cardano blockchain.
            It grew quickly to a beloved project in the Cardano community and is
            known for its pioneering work. Minting one of the first NFT
            collections, creating the NFT metadata standard and launching the
            first fully smart contract based marketplace got people excited
            about SpaceBudz.
          </div>
          <div className="w-full flex flex-col sm:flex-row">
            <div className="m-4">
              <StaticImage
                alt="team"
                draggable={false}
                src={TeamImage}
                placeholder="tracedSVG"
                className="w-full"
              />
            </div>
            <div className="text-justify">
              We (Zieg and Alessandro) the founders of SpaceBudz created the
              project out of curiosity about Cardano and its technology. We've
              always been passionate about crypto and tried to make things the
              right way. All we've done so far is open-source, we truly believe
              in decentralization and want to preserve these values at the core
              of the SpaceBudz project.
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default About;

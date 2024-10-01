import * as React from "react";
import { MainLayout } from "../layouts/mainLayout";

const TeamImage = "../images/team.jpg";

const About = () => {
  return (
    <MainLayout title="SpaceBudz | About" titleTwitter="SpaceBudz: About">
      <div className="w-full flex justify-center items-center mb-40">
        <div className="px-8 mt-4 md:mt-0 w-full max-w-2xl">
          <div className="font-bold text-primary text-3xl mb-16">About</div>
          <div className="w-full text-justify">""</div>
        </div>
      </div>
    </MainLayout>
  );
};

export default About;

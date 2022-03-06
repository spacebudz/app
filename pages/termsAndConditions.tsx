import * as React from "react";
import { MainLayout } from "../layouts/mainLayout";
import { Tabs } from "../components";

const TermsOfUse = () => {
  const categories = {
    License: (
      <div>
        <ol className="list-[upper-latin]">
          <li dir="ltr">
            <p dir="ltr">
              By purchasing a SpaceLabz BV (“SpaceBudz”) NFT either directly
              from SpaceBudz or on the secondary market, you are the owner of
              that applicable NFT (the “User Owned NFT”).
            </p>
          </li>
          <div className="h-2" />
          <li dir="ltr">
            <p dir="ltr">
              Subject to compliance with all other relevant terms and
              conditions, for as long as you own the User Owned NFT, SpaceBudz
              grants you a limited, personal, non-exclusive, non-sublicensable,
              worldwide license under any copyright owned by SpaceBudz to: (1)
              copy and modify the User Owned NFT (“Derivative NFT”) for
              non-commercial, personal use; and (2) display and perform the User
              Owned NFT and/or Derivative NFT for non- commercial, personal use.
            </p>
          </li>
          <div className="h-2" />
          <li dir="ltr">
            <p dir="ltr">
              Additionally, for as long as you own the User Owned NFT, SpaceBudz
              grants you a limited, personal, non-exclusive, worldwide license
              under any copyright owned by the SpaceBudz over that particular
              User Owned NFT to: (1) copy the User Owned NFT and/or Derivative
              NFT on to physical merchandise or digital collectables (“Licensed
              Merchandise”); (2) copy, display and perform the User Owned NFT
              and/or Derivative NFT for purposes of promoting and marketing the
              Licensed Merchandise, and (3) distribute the copies of User Owned
              NFT and/or Derivative NFT printed on the Licensed Merchandise in
              connection with the sale of the Licensed Merchandise, including
              doing any of the foregoing for commercial purposes up to the
              dollar limitations set forth herein.
            </p>
          </li>
          <ol style={{ marginLeft: 12, fontSize: 15 }}>
            <p dir="ltr">
              a. Nothing in this license allows for the use of SpaceBudz
              trademark, logo, or any SpaceBudz intellectual property other than
              the copyright rights explicitly licensed herein. Licensees are
              explicitly prohibited from using the SpaceBudz name in a way which
              may create confusion, mistake or deception about source or origin
              of the Licensed Merchandise.
            </p>
          </ol>
          <div className="h-2" />
          <li dir="ltr">
            <p dir="ltr">
              “Total Proceeds” shall mean gross revenue without any deductions.
              In no event may the Total Proceeds for all Licensed Merchandise
              for any single User Owned NFT and/or its Derivative NFT(s) exceed
              One Million US Dollars ($1,000,000) in aggregate during any
              calendar year (January 1-December 31). Once Total Proceeds has
              reached $1,000,000, or is expected to reach $1,000,000 in any
              calendar year, you must notify SpaceBudz and all sales or other
              distribution of Licensed Merchandise and any sales in excess of
              $1,000,000 must cease unless you and SpaceBudz have agreed in
              writing to the terms that will govern any future sales. Tracking
              and recording of Total Proceeds for the purpose of these dollar
              limitations will be done using generally accepted accounting
              principles. You will make such records available to SpaceBudz or
              its designee from time to time upon request of SpaceBudz for
              purposes of verifying your compliance with these Terms.
            </p>
          </li>
          <div className="h-2" />
          <li dir="ltr">
            <p dir="ltr">
              You will indemnify and hold harmless, and at SpaceBudz’s request
              defend, SpaceBudz from and against any and all claims, demands,
              liabilities, damages, penalties, fines, taxes, costs and expenses
              (including without limitation reasonable attorneys’ fees and court
              costs) arising out of or in connection with (a) any breach of
              these Terms or unauthorized use of any SpaceBudz-Owned Content, or
              (b) the design, manufacture, sale or other distribution or
              disposal of any Licensed Merchandise.
            </p>
          </li>
        </ol>
        <div className="h-2" />
        <br />
        <p dir="ltr" style={{ fontWeight: "bold" }}>
          RESERVATION OF RIGHTS
        </p>
        <div className="h-1" />
        <ol className="list-[upper-latin]">
          <li dir="ltr">
            <p dir="ltr">
              SpaceBudz reserves the right to modify these Terms at any time.
              SpaceBudz may freely transfer, assign, or delegate these Terms in
              whole or in part, without your prior written consent. The failure
              of SpaceBudz to exercise or enforce any right or provision of
              these Terms will not operate as a waiver of such right or
              provision. Except as otherwise provided herein, these Terms are
              intended solely for the benefit of the parties and are not
              intended to confer third-party beneficiary rights upon any other
              person or entity.
            </p>
          </li>
          <div className="h-2" />
          <li dir="ltr">
            <p dir="ltr">
              Nothing in these Terms shall prohibit SpaceBudz from granting any
              licenses on any SpaceBudz owned intellectual property, including
              but not limited to any User Owned NFT, to any third-parties under
              separate terms and conditions.
            </p>
          </li>
        </ol>
      </div>
    ),
    "In plain speak": (
      <>
        {" "}
        This license allows any SpaceBudz NFT owner to commercialize their
        SpaceBudz in pretty much any way they see fit. Whether that be creating
        T-shirts or apparel, a comic book, derivative art, etc. There are only
        two major exceptions. (1) if the commercialized products make or are
        expected to make over $1 million a year, that owner must reach a side
        agreement with the SpaceBudz to ensure the SpaceBudz vision is protected
        from outside large corporate cooption, and (2) you must be clear as to
        who is creating the product and not imply or suggest the originators of
        the Licensed Merchandise is the SpaceBudz team.
        <div className="h-2" />
        <p>
          That is it. It is not only permitted, but it is encouraged to team up
          with other SpaceBudz owners to create joint projects which utilize a
          group of the SpaceBudz images. The team does not want this to be
          limited to your profile picture, and wants you to seek every
          opportunity to profit off your SpaceBudz NFT holdings and expand the
          SpaceBudz universe.{" "}
        </p>
      </>
    ),
    Examples: (
      <div>
        <div className="font-bold">
          Examples of What is Permitted Under License
        </div>
        <div className="h-2" />

        <ul className="list-disc">
          <li>
            Setting up a marketplace to sell T-shirts with your SpaceBudz on the
            shirts. Or selling those shirts in bulk to a major retailer to sell.
          </li>
          <li>Creating a comic book with other SpaceBudz owners.</li>
          <li>
            Creating and selling derivative art using your owned SpaceBudz as
            the starting piece.{" "}
          </li>
          <li>
            Sublicensing your SpaceBudz to others to use (so long as the
            sub-licensor does not exceed the $1 million a year threshold).{" "}
          </li>
        </ul>
        <div className="h-6" />

        <div className="font-bold">
          Examples of What is Not Permitted Under License
        </div>
        <div className="h-2" />
        <ul className="list-disc">
          <li>
            Selling over $1 million in merchandise in a year without approval of
            SpaceBudz team.
          </li>
          <li>
            Sublicensing to a major corporation like Disney and letting Disney
            sell over $1 million in merchandise a year without approval of
            SpaceBudz team.
          </li>
          <li>
            Creating products which feature the SpaceBudz name in a way which
            would make the average consumer believe the SpaceBudz team created
            or is associated with the sale of that product.{" "}
          </li>
          <li>
            Using a SpaceBudz image which you do not own without consent of the
            actual owner.{" "}
          </li>
        </ul>
      </div>
    ),
  };

  return (
    <MainLayout
      title="SpaceBudz | Terms"
      titleTwitter="SpaceBudz: Terms and Conditions"
    >
      <div className="w-full flex justify-center items-center">
        <div className="px-6 mt-4 md:mt-0 max-w-5xl w-full">
          <div className="font-bold text-primary text-3xl mb-16">
            Terms and Conditions
          </div>
          <div>
            <Tabs categories={categories} />
          </div>
          <div className="mb-40" />
        </div>
      </div>
    </MainLayout>
  );
};

export default TermsOfUse;

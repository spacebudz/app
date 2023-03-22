import * as React from "react";
import { MainLayout } from "../layouts/mainLayout";
import { Button, Tabs } from "../components";

const License = () => {
  const categories = {
    Overview: (
      <div className="flex flex-col">
        <div>
          The license associated with SpaceBudz's Intellectual Property (Ip)
          token can be tracked on the Cardano blockchain. The Ip token contains
          a link to the license, along with its hash. You can view the Ip token
          and its associated information at the provided link{" "}
          <a
            href="https://cardanoscan.io/token/4523c5e21d409b81c95b45b0aea275b8ea1406e6cafea5583b9f8a5f00258a504970"
            target="_blank"
            className="text-purple-500 font-semibold"
          >
            here
          </a>
          .
        </div>
        <div className="mt-4 mb-4 text-left">
          Hash (SHA-256):{" "}
          <span className="font-semibold break-all">
            4d6ecac4df1da28957ac2f94f1d117eebf5505625d515d3acfe66f77cd7560c0
          </span>
        </div>
        <a href="/license.pdf" target="_blank" className="w-fit">
          <Button size="sm">View License</Button>
        </a>
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
      title="SpaceBudz | License"
      titleTwitter="SpaceBudz: NFT License"
    >
      <div className="w-full flex justify-center items-center">
        <div className="px-6 mt-4 md:mt-0 max-w-5xl w-full">
          <div className="font-bold text-primary text-3xl mb-16">License</div>
          <div>
            <Tabs categories={categories} />
          </div>
          <div className="mb-40" />
        </div>
      </div>
    </MainLayout>
  );
};

export default License;

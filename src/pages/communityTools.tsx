import { graphql, useStaticQuery } from "gatsby";
import { GatsbyImage, getImage } from "gatsby-plugin-image";
import * as React from "react";
import { MainLayout } from "../layouts/mainLayout";

const CommunityTools = () => {
  const data = useStaticQuery(graphql`
    query {
      allToolsRegistryJson {
        edges {
          node {
            name
            image {
              childImageSharp {
                gatsbyImageData(placeholder: BLURRED)
              }
              extension
              publicURL
            }
            url
            description
          }
        }
      }
    }
  `);
  return (
    <MainLayout
      title="SpaceBudz | Community tools"
      titleTwitter="SpaceBudz: Community tools"
    >
      <div className="w-full flex justify-center items-center mb-40">
        <div className="px-6 mt-4 md:mt-0 max-w-5xl w-full">
          <div className="font-bold text-primary text-3xl mb-16">
            Community tools
          </div>
          <div className="w-full grid grid-cols-mainLg gap-4">
            {data.allToolsRegistryJson.edges.map((node, key) => (
              <div
                className="border-2 border-b-4 rounded-xl flex flex-col overflow-hidden bg-white"
                key={key}
              >
                <a href={node.node.url} target="_blank">
                  <div className="w-full h-[170px] bg-gray-200 border-b-2 overflow-hidden">
                    {!node.node.image.childImageSharp &&
                    node.node.image.extension === "svg" ? (
                      <img
                        className="w-full h-full object-cover"
                        src={node.node.image.publicURL}
                      />
                    ) : (
                      <GatsbyImage
                        className="w-full h-full"
                        image={getImage(node.node.image)}
                        alt={node.node.name}
                      />
                    )}
                  </div>
                  <div className="w-full p-4">
                    <div className="font-semibold text-lg mb-2">
                      {node.node.name}
                    </div>
                    <div className="text-slate-500 text-sm">
                      {node.node.description}
                    </div>
                  </div>
                </a>
              </div>
            ))}
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default CommunityTools;

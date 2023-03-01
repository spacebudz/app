import { graphql, useStaticQuery } from "gatsby";
import * as React from "react";
import { MainLayout } from "../layouts/mainLayout";
import { Search } from "@styled-icons/fa-solid/Search";
import { FilterAlt } from "@styled-icons/material-rounded/FilterAlt";
import { useStoreActions, useStoreState } from "easy-peasy";
import {
  Gallery,
  useFiltering,
  SortSelection,
  FilterPanel,
} from "../parts/explore";
import { Input, Spinner } from "../components";
import { FlatButton } from "../components/Button/FlatButton";
import { Dialog } from "../components/Dialog";
import {
  getActivity,
  getAllMigrated,
  getBidsMap,
  getListingsMap,
} from "../api";
import { useIsMounted } from "../hooks";
import { Activity, RecentActivity } from "../parts/explore/RecentActivity";

const Explore = () => {
  const data = useStaticQuery(graphql`
    query {
      allMetadataJson {
        edges {
          node {
            budId
            name
            image
            type
            traits
            mint
          }
        }
      }
    }
  `);
  const [exploreStates, exploreActions] = [
    useStoreState<any>((state) => state.explore),
    useStoreActions<any>((actions) => actions.explore),
  ];
  const [array, setArray] = [exploreStates.array, exploreActions.setArray];
  const [activity, setActivity] = [
    exploreStates.activity,
    exploreActions.setActivity,
  ];
  const [lastUpdate, renewLastUpdate] = [
    exploreStates.lastUpdate,
    exploreActions.renewLastUpdate,
  ];

  const [stretch, setStretch] = React.useState(false);
  const dialogRef = React.useRef<any>();

  const [loading, setLoading] = React.useState(false);

  const isMounted = useIsMounted();

  const interval = React.useRef<NodeJS.Timer>();

  const migratedBudz = React.useRef<number[]>([]);

  const init = async () => {
    if (!array || !lastUpdate || Date.now() - lastUpdate > 60000) {
      if (!array) setLoading(true);
      renewLastUpdate();
      const listings = await getListingsMap();
      const bids = await getBidsMap();
      const budImageMap = {};

      migratedBudz.current = await getAllMigrated();

      const result = data.allMetadataJson.edges.map((node) => {
        // side effect, stores images in a map to look them up quicker in activity array
        budImageMap[node.node.budId] = node.node.image;
        node.node.needsToMigrate = !migratedBudz.current.includes(
          node.node.budId
        );

        return {
          ...node.node,
          buy: listings.has(node.node.budId)
            ? listings.get(node.node.budId).amount
            : null,
          bid: bids.has(node.node.budId)
            ? bids.get(node.node.budId).amount
            : null,
        };
      });

      const activityRaw = await getActivity();
      const activity: Activity[] = activityRaw.map((ac) => ({
        ...ac,
        image: budImageMap[ac.budId],
        needsToMigrate: !migratedBudz.current.includes(ac.budId),
      }));

      if (isMounted.current) {
        setActivity(activity);
        setArray(result);
        setLoading(false);
      }
    }

    // check for new activies every 10s
    interval.current = setInterval(async () => {
      const activityRaw = await getActivity();
      const budImageMap = {};
      data.allMetadataJson.edges.map((node) => {
        // side effect, stores images in a map to look them up quicker in activity array
        budImageMap[node.node.budId] = node.node.image;
      });

      const activity: Activity[] = activityRaw.map((ac) => ({
        ...ac,
        image: budImageMap[ac.budId],
        needsToMigrate: !migratedBudz.current.includes(ac.budId),
      }));
      if (isMounted.current) {
        setActivity(activity);
      }
    }, 10000);
  };

  React.useEffect(() => {
    init();
    return () => {
      clearInterval(interval.current);
    };
  }, []);

  const {
    filter,
    sort,
    search,
    setTypes,
    setGadgets,
    setSearch,
    setOnSale,
    setOnBid,
    setBidRange,
    setGadgetsCount,
    setBuyRange,
    setSort,
    clear,
  } = useFiltering();

  return (
    <MainLayout title="SpaceBudz | Explore" titleTwitter="SpaceBudz: Explore">
      <div className="w-full flex flex-grow relative mb-40">
        <div className="w-[20.8rem] relative flex-grow-0  hidden lg:block">
          <FilterPanel
            filter={filter}
            setBidRange={setBidRange}
            setBuyRange={setBuyRange}
            setGadgets={setGadgets}
            setGadgetsCount={setGadgetsCount}
            setOnBid={setOnBid}
            setOnSale={setOnSale}
            setTypes={setTypes}
            clear={clear}
          />
        </div>
        <div className="w-[calc(100vw-2rem)] lg:w-[calc(100vw-23.8rem)] flex-grow flex flex-col mx-4">
          {loading ? (
            <div className="w-full h-full flex justify-center items-center flex-col">
              <Spinner theme="violet" className="!w-6 md:!w-8" />
              <div className="mt-8 md:mt-10 font-medium text-slate-500">
                Loading SpaceBudz...
              </div>
            </div>
          ) : (
            <>
              <div className="text-xl font-semibold mb-2">Recent Activity</div>
              <RecentActivity array={activity} />
              <div className="flex items-center py-4 w-full flex-col sm:flex-row">
                <Input
                  theme="space"
                  defaultValue={search}
                  onKeyDown={(e) =>
                    e.key === "Enter" &&
                    setSearch({ search: e.currentTarget.value })
                  }
                  onChange={(e) =>
                    !e.target.value && search && setSearch({ search: null })
                  }
                  placeholder="Search id, type, gadget"
                  classNameContainer="sm:flex-[0_0_60%]"
                  leftEl={<Search size={14} />}
                />
                <div className="w-full mt-2 sm:mt-0 sm:flex-[0_0_40%] sm:pl-14 flex justify-center">
                  <SortSelection sort={sort} setSort={setSort} />
                </div>
              </div>
              <Gallery array={array} filtering={{ filter, search, sort }} />
            </>
          )}
        </div>
        <div
          className={`${
            stretch ? "bottom-0 left-0" : "bottom-2 left-2"
          } fixed lg:hidden duration-100 z-20`}
        >
          <FlatButton
            size="lg"
            className={`${
              stretch ? "!w-screen !scale-100  rounded-b-none" : ""
            } duration-200`}
            onClick={() => {
              if (!stretch) dialogRef.current.open();
              else dialogRef.current.close();
              setStretch((s) => !s);
            }}
          >
            {stretch ? "Close" : <FilterAlt size={24} />}
          </FlatButton>
        </div>
        <Dialog
          ref={dialogRef}
          fullscreen
          position="top"
          noOverlay
          noAutoClose
          className="border-none rounded-none h-screen !bg-white"
        >
          <FilterPanel
            filter={filter}
            setBidRange={setBidRange}
            setBuyRange={setBuyRange}
            setGadgets={setGadgets}
            setGadgetsCount={setGadgetsCount}
            setOnBid={setOnBid}
            setOnSale={setOnSale}
            setTypes={setTypes}
            clear={clear}
          />
        </Dialog>
      </div>
    </MainLayout>
  );
};

export default Explore;

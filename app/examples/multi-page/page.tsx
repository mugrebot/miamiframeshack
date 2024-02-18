import {
  FrameButton,
  FrameContainer,
  FrameImage,
  FrameReducer,
  NextServerPageProps,
  getPreviousFrame,
  useFramesReducer,
} from "frames.js/next/server";
import Link from "next/link";

type State = {
  pageIndex: number;
  currentPage: number;
};


//lets fetch a response from https://dappapi.propy.com/nft/base/propykeys?perPage=20&page=1&landmark=true and log it in the console, specifically "metadata":{"pagination":{"total":307,"count":20,"perPage":20,"currentPage":1,"totalPages":16}}}} metadata
//the total number of pages is 16, and the total number of items is 307
//this currently only returns the first page, use page index to count what page we are on (1-16)
//and use the perPage to count how many items are on a page (20)
//fetchNFT will take in a page index and return the data for that page
//remember to change the 1 in "https://dappapi.propy.com/nft/base/propykeys?perPage=20&page=1&landmark=true"

const fetchNFTs = async (currentPage) => {
  const url = `https://dappapi.propy.com/nft/base/propykeys?perPage=20&page=${currentPage}&landmark=true`;
  const response = await fetch(url);
  const data = await response.json();
  return data;
};




//lets call the function once the page loads, and only once

export const data = await fetchNFTs();

export const  metadata = data?.metadata?.pagination?.totalPages;


const totalPages = 307;
const initialState: State = { pageIndex: 0, currentPage: 1};

const itemsPerPage = 20; // Assuming 20 items per page

const reducer: FrameReducer<State> = (state, action) => {
  let { pageIndex, currentPage } = state;
  const buttonIndex = action.postBody?.untrustedData.buttonIndex;
  
  if (buttonIndex === 2) { // Assuming buttonIndex 2 is for next
    pageIndex++;
    if (pageIndex >= itemsPerPage) {
      pageIndex = 0;
      currentPage++;
    }
  } else if (buttonIndex === 1) { // Assuming buttonIndex 1 is for previous
    pageIndex--;
    if (pageIndex < 0) {
      pageIndex = itemsPerPage - 1;
      currentPage = Math.max(1, currentPage - 1);
    }
  }

  return {
    pageIndex,
    currentPage
  };
};




// This is a react server component only
export default async function Home({
  params,
  searchParams,
}: NextServerPageProps) {
  const previousFrame = getPreviousFrame<State>(searchParams);
  const [state] = useFramesReducer<State>(reducer, initialState, previousFrame);
  const imageUrl = data.data.data[state.pageIndex].metadata.image;
  //image url must be converted to https://ipfs.io/ipfs/UID format currently its in form
  //ipfs://QmXuPehc8EYDnCVCrDSVuEUyBrWkUSKhkRwfquRVoUgFF5
  const ipfsUrl = imageUrl.replace('ipfs://', 'https://ipfs.io/ipfs/')|| "https://i.stack.imgur.com/oeBTR.png";
  const currentNFT = data.data.data[state.pageIndex];
const nftAttributes = currentNFT.metadata.attributes.reduce((acc, attr) => {
  acc[attr.trait_type] = attr.value;
  return acc;
}, {});

const data2 = await fetchNFTs(state.currentPage);
const  metadata2 = data?.metadata?.pagination?.totalPages;


fetchNFTs(state.currentPage).then((newData) => {
  // Update your component state or context with newData here
  console.log(`New data for currentPage ${state.currentPage}:`, newData);
});

//update ipfsURL and current NFT 
const imageUrl2 = data2.data.data[state.pageIndex].metadata.image;
const ipfsUrl2 = imageUrl2.replace('ipfs://', 'https://ipfs.io/ipfs/')|| "https://i.stack.imgur.com/oeBTR.png";
const currentNFT2 = data2.data.data[state.pageIndex];
const nftAttributes2 = currentNFT2.metadata.attributes.reduce((acc, attr) => {
  acc[attr.trait_type] = attr.value;
  return acc;
}, {});

console.log("yeet2", state.currentPage);
const currentSlideNumber = (state.currentPage - 1) * itemsPerPage + state.pageIndex + 1;

console.log("yeet3", currentSlideNumber);



  // then, when done, return next frame
  return (
    <div>
      Multi-page example {state.currentPage}<Link href="/debug">Debug</Link>
      <FrameContainer
        pathname="/examples/multi-page"
        postUrl="/examples/multi-page/frames"
        state={state}
        previousFrame={previousFrame}
      >
        <FrameImage>
          <div tw="flex flex-col">
            <img width={573} height={300} src={ipfsUrl2 || ipfsUrl} alt="Image" />
            <div tw="flex">
            This is slide {currentSlideNumber} / {totalPages}
            </div>
            <div tw="flex">
              Landmark: {nftAttributes2['Landmark'] || nftAttributes['Landmark']}
            </div>
            <div tw="flex">
              Country: {nftAttributes2['Country'] || nftAttributes['Country']}
            </div>
            <div tw="flex">
              Status: {nftAttributes2['Status'] || nftAttributes['Status']}
            </div>
          </div>
        </FrameImage>
        <FrameButton>←</FrameButton>
        <FrameButton>→</FrameButton>
        <FrameButton action="link" target="propykeys.com">
  Mint your Own! @propy
</FrameButton>

        
      </FrameContainer>
    </div>
  );
}

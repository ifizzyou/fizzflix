import { useQuery } from "react-query";
import styled from "styled-components";
import { motion, AnimatePresence, useViewportScroll } from "framer-motion";
import { getMovies, IGetMoviesResult } from "../api";
import { makeImagePath } from "../utils";
import { useEffect, useState } from "react";
import { useHistory, useRouteMatch } from "react-router-dom";

const Slider = styled.div`
  position: relative;
  top: -200px;
`;

const Row = styled(motion.div)`
  display: grid;
  gap: 5px;
  grid-template-columns: repeat(6, 1fr);
  position: absolute;
  width: 100%;
`;

const Box = styled(motion.div)<{ bgPhoto: string }>`
  background-image: url(${(props) => props.bgPhoto});
  background-size: cover;
  background-position: center center;
  height: 200px;
  color: ${(props) => props.theme.white.lighter};
  font-size: 66px;
  cursor: pointer;
  &:first-child {
    transform-origin: center left;
  }
  &:last-child {
    transform-origin: center right;
  }
`;

const Info = styled(motion.div)`
  padding: 10px;
  background-color: ${(props) => props.theme.black.lighter};
  opacity: 0;
  position: absolute;
  width: 100%;
  bottom: 0;
  h4 {
    text-align: center;
    font-size: 18px;
  }
`;

const Overlay = styled(motion.div)`
  position: fixed;
  top: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  opacity: 0;
`;

const BigMovie = styled(motion.div)`
  position: absolute;
  width: 40vw;
  height: 80vh;
  left: 0;
  right: 0;
  margin: 0 auto;
  border-radius: 15px;
  overflow: hidden;
  background-color: ${(props) => props.theme.black.lighter};
`;

const BigCover = styled.div`
  width: 100%;
  background-size: cover;
  background-position: center center;
  height: 400px;
`;

const BigTitle = styled.h3`
  color: ${(props) => props.theme.white.lighter};
  padding: 20px;
  font-size: 46px;
  position: relative;
  top: -80px;
`;

const BigOverview = styled.p`
  padding: 20px;
`;

const infoVariants = {
  hover: {
    opacity: 1,
    transition: {
      delay: 0.4,
      duration: 0.2,
      type: "tween",
    },
  },
};
const FirstContentsLine = styled.div`
  position: relative;
  margin: 0 20px;
  top: -210px;
  display: flex;
  justify-content: space-between;
`;
const offset = 6;

const boxVariants = {
  normal: {
    scale: 1,
  },
  hover: {
    scale: 1.3,
    y: -50,
    transition: {
      delay: 0.4,
      duration: 0.2,
      type: "tween",
    },
  },
};

const Div = styled.div`
  /* background-color: blue; */
  width: 100%;
  height: 66px;
  position: absolute;
  /* top: -230px; */
`;

const ContentsLine = styled.div`
  position: relative;
  margin: 20px;
  display: flex;
  justify-content: space-between;
`;

const ContentsText = styled.div`
  font-size: 20px;
  font-weight: 500;
  color: white;
`;

const ContentsSwap = styled.div``;
const SwapButton = styled.button`
  font-size: 20px;
  margin: 0 10px;
`;

const Banner = styled.div<{ bgPhoto: string }>`
  height: 100vh;
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: 60px;
  background-image: linear-gradient(rgba(0, 0, 0, 0), rgba(0, 0, 0, 1)),
    url(${(props) => props.bgPhoto});
  background-size: cover;
`;

const Title = styled.h2`
  font-size: 68px;
  margin-bottom: 20px; ;
`;

const Overview = styled.p`
  font-size: 30px;
  width: 50%;
`;

const NowPlayingLine = (() => {
  const { data } = useQuery<IGetMoviesResult>(
    ["movies", "now_playing"],
    getMovies
  );
  const history = useHistory();
  const bigMovieMatch = useRouteMatch<{ movieId: string }>("/movies/:movieId");
  const [slideDirection1, setSlide] = useState(0);

  const { scrollY } = useViewportScroll();
  const [index1, setIndex] = useState(0);
  const [leaving, setLeaving] = useState(false);
  const rowVariants = {
    initial: () => {
      return {
        x:
          slideDirection1 === 1 ? window.outerWidth + 5 : -window.outerWidth - 5,
      };
    },
    animate: () => {
      return { x: 0 };
    },

    exit: () => {
      return {
        x:
          slideDirection1 === 1
            ? -window.outerWidth - 5
            : +window.outerWidth + 5,
      };
    },
  };
  const increaseIndex = () => {
    setSlide(1);
    if (data) {
      if (leaving) return;
      setLeaving(true);
      const totalMovies = data?.results.length - 1;
      const maxIndex = Math.floor(totalMovies / offset) - 1;
      setIndex((prev) => (prev === maxIndex ? 0 : prev + 1));
    }
  };

  const decreaseIndex = () => {
    setSlide(-1);

    if (data) {
      if (leaving) return;
      setLeaving(true);
      const totalMovies = data?.results.length - 1;
      const maxIndex = Math.floor(totalMovies / offset) - 1;
      setIndex((prev) => (prev === 0 ? maxIndex : prev - 1));
    }
  };

  const toggleLeaving = () => setLeaving((prev) => !prev);
  const onBoxClicked = (movieId: number) => {
    history.push(`/movies/${movieId}`);
  };
  const onOverlayClick = () => history.push("/");
  const clickedMovie =
    bigMovieMatch?.params.movieId &&
    data?.results.find((movie) => movie.id === +bigMovieMatch.params.movieId);
  console.log(clickedMovie);
  return (
    <>
      <Banner
        // onClick={incraseIndex}
        bgPhoto={makeImagePath(data?.results[0].backdrop_path || "")}
      >
        <Title>{data?.results[0].title}</Title>
        <Overview>{data?.results[0].overview}</Overview>
      </Banner>
      
      <FirstContentsLine>
        <ContentsText>Now Playing</ContentsText>
        <ContentsSwap>
          <SwapButton onClick={decreaseIndex}>prev</SwapButton>
          <SwapButton onClick={increaseIndex}>next</SwapButton>
        </ContentsSwap>
      </FirstContentsLine>
      <Slider>
        <AnimatePresence
          initial={false}
          onExitComplete={toggleLeaving}
          custom={slideDirection1}
        >
          {
            <Row
              variants={rowVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={{ type: "tween", duration: 0.6 }}
              custom={slideDirection1}
              key={index1}
            >
              {data?.results
                .slice(1)
                .slice(offset * index1, offset * index1 + offset)
                .map((movie) => (
                  <Box
                    layoutId={movie.id + ""}
                    key={movie.id}
                    whileHover="hover"
                    initial="normal"
                    variants={boxVariants}
                    onClick={() => onBoxClicked(movie.id)}
                    // transition={{type:"tween"}}
                    bgPhoto={makeImagePath(movie.backdrop_path, "w500")}
                  >
                    {/* <img></img> */}
                    <Info variants={infoVariants}>
                      <h4>{movie.title}</h4>
                    </Info>
                  </Box>
                ))}
            </Row>
          }
        </AnimatePresence>
      </Slider>

      {/* <AnimatePresence>
        {bigMovieMatch ? (
          <>
            <Overlay
              onClick={onOverlayClick}
              exit={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            />
            <BigMovie
              style={{ top: scrollY.get() + 100 }}
              layoutId={bigMovieMatch.params.movieId}
            >
              {clickedMovie && (
                <>
                  <BigCover
                    style={{
                      backgroundImage: `linear-gradient(to top,black,transparent), url(${makeImagePath(
                        clickedMovie.backdrop_path,
                        "w500"
                      )})`,
                    }}
                  />

                  <BigTitle>{clickedMovie.title }</BigTitle>
                  <BigOverview>{clickedMovie.overview.length > 10 ? clickedMovie.overview.substr(0,10) + "..." : clickedMovie.overview}</BigOverview>
                </>
              )}
            </BigMovie>
          </>
        ) : null}
      </AnimatePresence> */}
    </>
  );
})
export default NowPlayingLine;

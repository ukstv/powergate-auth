import styled from "@emotion/styled";

const HolyGrailContainer = styled.div`
  display: flex;
  flex-direction: column;
`;

const HolyGrailMain = styled.div`
  /* Take the remaining height */
  flex-grow: 1;

  /* Layout the left sidebar, main content and right sidebar */
  display: flex;
  flex-direction: row;
`;

const HolyGrailLeft = styled.aside`
  width: 25%;
`;

const HolyGrailRight = styled.nav`
  width: 20%;
`;

const HolyGrailBody = styled.main`
  /* Take the remaining width */
  flex-grow: 1;
`;

export const HolyGrailLayout = {
  Container: HolyGrailContainer,
  Body: HolyGrailBody,
  Left: HolyGrailLeft,
  Right: HolyGrailRight,
  Main: HolyGrailMain
};

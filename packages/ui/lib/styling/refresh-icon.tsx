import styled from "@emotion/styled";
import { BiRefresh } from "react-icons/bi";
import * as System from "slate-react-system";

export const RefreshIcon = styled(BiRefresh)`
  vertical-align: bottom;
  cursor: pointer;
  &:hover {
    color: ${System.Constants.system.brand};
  }
`;

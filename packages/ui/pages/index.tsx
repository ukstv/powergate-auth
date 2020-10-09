import React from "react";
import { HolyGrailLayout } from "../lib/styling/holy-grail-layout";
import { Header } from "../lib/styling/header";
import { FileUploadForm } from "../lib/components/file-upload-form";
import { FileList } from "../lib/components/file-list";

export default function Home() {
  return (
    <HolyGrailLayout.Container>
      <Header />
      <HolyGrailLayout.Main>
        <HolyGrailLayout.Left></HolyGrailLayout.Left>
        <HolyGrailLayout.Body>
          <FileUploadForm />
          <FileList />
        </HolyGrailLayout.Body>
        <HolyGrailLayout.Right></HolyGrailLayout.Right>
      </HolyGrailLayout.Main>
    </HolyGrailLayout.Container>
  );
}

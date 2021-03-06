import React, { ChangeEvent, FormEvent, useState } from "react";
import * as Backend from "../backend-connection";
import { useSubject } from "../plumbing/use-subject";
import * as System from "slate-react-system";
import styled from "@emotion/styled";

const FormContainer = styled.form`
  font-family: ${System.Constants.font.text};
  box-sizing: border-box;
  padding: 24px;
  border-radius: 4px;
  background-color: white;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.08);
  border: 1px solid ${System.Constants.system.border};
  width: 100%;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
`;

export function FileUploadForm() {
  const backend = Backend.useBackend();
  const backendState = useSubject(backend);
  const [file, setFile] = useState(null);
  const [progress, setProgress] = useState(false);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    setProgress(true);
    event.preventDefault();
    const form = event.currentTarget;
    if (backendState.status === Backend.Status.CONNECTED && file) {
      const formData = new FormData();
      formData.append("file", file, file.name);
      fetch(`${backendState.endpoint}/files/upload`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${backendState.authToken}`,
        },
        body: formData,
      })
        .then(() => {
          setProgress(false);
          form.reset();
        })
        .catch((err) => {
          console.error(err)
          setProgress(false);
          form.reset();
        });
    }
  };

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    setFile(event.target.files[0]);
  };

  const renderButton = () => {
    if (progress) {
      return <System.ButtonDisabled>Uploading...</System.ButtonDisabled>;
    } else {
      const isDisabled = !file;
      const Button = isDisabled
        ? System.ButtonDisabled
        : System.ButtonSecondary;
      return (
        <Button type={"submit"} disabled={!file}>
          Upload
        </Button>
      );
    }
  };

  if (backendState.status === Backend.Status.CONNECTED) {
    const isDisabled = !file;
    const Button = isDisabled ? System.ButtonDisabled : System.ButtonSecondary;
    return (
      <div>
        <System.H1>Upload file</System.H1>
        <FormContainer onSubmit={handleSubmit}>
          <input type="file" onChange={handleFileChange} />
          {renderButton()}
        </FormContainer>
      </div>
    );
  } else {
    return <></>;
  }
}

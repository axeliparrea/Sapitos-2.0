import "@ui5/webcomponents/dist/Assets.js";
import "@ui5/webcomponents-fiori/dist/Assets.js";

import {
  Button,
  Card,
  CardHeader,
  Input,
  Title,
  Text
} from "@ui5/webcomponents-react";

function App() {
  return (
    <div style={{ padding: "2rem" }}>
      <Card
        header={
          <CardHeader
            titleText="Grimoire React UI5"
            subtitleText="by @ui5/webcomponents-react"
          />
        }
        style={{ width: "400px" }}
      >
        <div style={{ padding: "1rem" }}>
          <Title level="H4">Bienvenido Mago</Title>
          <Text>Esto es un ejemplo usando UI5 + React</Text>
          <Input placeholder="Escribe tu hechizo..." />
          <br /><br />
          <Button onClick={() => alert("¡Hechizo lanzado!")}>
            Lanzar Hechizo
          </Button>
        </div>
      </Card>
    </div>
  );
}

export default App;

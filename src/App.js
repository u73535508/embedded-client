import React, { useEffect, useState, useRef } from "react";
import { Layout, Typography, Button, Spin } from "antd";
import styled from "styled-components";

const { Header, Content } = Layout;
const { Title } = Typography;

const App = () => {
  const [humidity, setHumidity] = useState("--");
  const [loading, setLoading] = useState(false);
  const [fetchingHumidity, setFetchingHumidity] = useState(false);
  const intervalRef = useRef();

  useEffect(() => {
    const fetchHumidity = () => {
      if (fetchingHumidity) return;

      setFetchingHumidity(true);
      fetch("https://embedded-server.onrender.com/gethumidity")
        .then((response) => response.json())
        .then((data) => {
          // data max 1000, data min 700
          let mappedHumidity = 100 - ((data.humidity - 700) / 300) * 100;

          mappedHumidity = Math.floor(mappedHumidity);
          if (mappedHumidity < 0) {
            mappedHumidity = 0;
          }
          if (mappedHumidity > 100) {
            mappedHumidity = 100;
          }
          //console.log("formattedHumidity", formattedHumidity);

          setHumidity(mappedHumidity);
          setFetchingHumidity(false);
        })
        .catch((error) => {
          console.error("Error while fetching humidity:", error);
          setFetchingHumidity(false);
        });
    };

    fetchHumidity();
    intervalRef.current = setInterval(fetchHumidity, 3000);

    return () => clearInterval(intervalRef.current);
  }, [fetchingHumidity]);

  const startWatering = () => {
    setLoading(true);

    fetch("https://embedded-server.onrender.com/startmotor", {
      method: "POST",
    })
      .then((response) => response.json())
      .then((data) => {
        console.log("Motor started:", data);
        setTimeout(() => {
          setLoading(false);
        }, 5000);
      })
      .catch((error) => {
        console.error("Error while starting motor:", error);
        setLoading(false);
      });
  };

  return (
    <Layout style={{ minHeight: "100vh", backgroundColor: "#d4f7dc" }}>
      <StyledHeader>
        <Title level={2} style={{ color: "#189A50", textAlign: "center" }}>
          Eco-Friendly Plant Care
        </Title>
      </StyledHeader>
      <Content>
        <Container>
          <HumidityDisplay>
            Humidity Level: <span>{humidity}</span>%
          </HumidityDisplay>
          <ButtonContainer>
            <StyledButton onClick={startWatering} disabled={loading}>
              {loading ? <SpinIndicator /> : "Water Plant"}
            </StyledButton>
            {loading && <SpinnerLabel>Watering in Progress...</SpinnerLabel>}
          </ButtonContainer>
        </Container>
        <AdditionalInfo>
          The optimal humidity level for your plant is generally between 50% to
          70%.
        </AdditionalInfo>
      </Content>
    </Layout>
  );
};

export default App;

const StyledHeader = styled(Header)`
  background-color: #52c41a;
  padding: 0;
`;

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 70vh; /* Take up only 70% of the page */
`;

const HumidityDisplay = styled.div`
  font-size: 24px;
  margin-bottom: 20px;
  text-align: center;

  span {
    font-weight: bold;
    color: #189a50;
  }
`;

const ButtonContainer = styled.div`
  position: relative;
  text-align: center;
`;

const StyledButton = styled(Button)`
  background-color: #189a50;
  border-color: #189a50;
  color: #fff;
  font-weight: bold;
  width: 200px;

  &:hover,
  &:focus {
    background-color: #147a3b;
    border-color: #147a3b;
  }
`;

const SpinnerLabel = styled.div`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  color: #fff;
  font-weight: bold;
  z-index: 1; /* Ensure it's on top of the spinner */
`;

const SpinIndicator = styled(Spin)`
  margin-right: 8px;
`;

const AdditionalInfo = styled.div`
  text-align: center;
  margin-top: 20px;
  font-size: 16px;
  color: #595959;
`;

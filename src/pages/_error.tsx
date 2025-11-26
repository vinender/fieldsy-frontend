import Error from "next/error";

const CustomErrorComponent = (props: { statusCode: number }) => {
  return <Error statusCode={props.statusCode} />;
};

CustomErrorComponent.getInitialProps = async (contextData: { res?: { statusCode?: number }; err?: { statusCode?: number } }) => {
  // This will contain the status code of the response
  return Error.getInitialProps(contextData as any);
};

export default CustomErrorComponent;

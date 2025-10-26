
interface ComponentProps {
    prop1: prop1Type;
    prop2: prop2Type;
  }
  
  /**
   * Use JSDoc styling right above the header if this component is important.
   * z`
   * Also, the name of the component should capitalized, and the file should be the same.
   * */
  const Component = (props: ComponentProps) => {
    const { prop1, prop2 } = props;
  };
import { Redirect } from "expo-router";
import { useAuth } from '@clerk/clerk-expo';
import '../global.css';

const Home = () => {
  return <Redirect href="/(auth)/welcome" />;
};

export default Home;
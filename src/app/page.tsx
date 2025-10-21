import Footer from '../components/Footer';
import NavBar from '../components/NavBar';


export default function Home() {
  return (
    //Had to make changes to className so that Navbar and Footer aligned - Jeremiah
    //Just kinda deleted the main content stuff
    <div className="font-sans min-h-screen flex flex-col">
      {/* Top spacer */}
      <NavBar  />

      {/* Main content */} 
      <main className="flex-grow">
      </main>

      {/* Bottom spacer */}
      <Footer /> 
      
    
    </div>
  );
}

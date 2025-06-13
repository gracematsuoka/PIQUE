import TopBar from "../TopBar"
import NavBar from "../NavBar"
import { useEffect } from "react"
import { auth } from "../../../firebase"

const Explore = () => {
    useEffect(() => {
        const getToken = async () => {
            const user = auth.currentUser;

            if (user) {
                const token = await user.getIdToken();
            } else {
                console.log('No user is signed in')
            }
        }

        getToken();
    }, []);

    return (
        <div className="explore">
            <TopBar/>
            <NavBar/>
        </div>
    )
} 

export default Explore
import TopBar from "../TopBar"
import { useEffect } from "react"
import { auth } from "../../../firebase"

const Explore = () => {
    useEffect(() => {
        const getToken = async () => {
            const user = auth.currentUser;

            if (user) {
                const token = await user.getIdToken();
                console.log('Firebase ID Token:', token);
            } else {
                console.log('No user is signed in')
            }
        }

        getToken();
    }, []);

    return (
        <div className="explore">
            <TopBar/>
        </div>
    )
} 

export default Explore
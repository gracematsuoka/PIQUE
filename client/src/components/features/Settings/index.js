import TopBar from "../TopBar"
import NavBar from "../NavBar"
import AccountSetup from "../../home-content/AccountSetup"

const Settings = () => {
    return (
        <div className="settings">
            <TopBar/>
            <div className="nav-content">
                <NavBar/>

                <div className="nav-content-wrapper">
                    <AccountSetup mode='update'/>
                </div>
            </div>
        </div>
    )
}

export default Settings
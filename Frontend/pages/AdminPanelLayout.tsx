import Header from "@/components/Header"
import { Outlet } from "react-router-dom"

const AdminPanelLayout = () => {
    return (
        <main className=" h-[100vh] bg-white">
            <Header/>
            <Outlet/>
        </main>

    )
}

export default AdminPanelLayout;
import type { User } from "@supabase/supabase-js";
import { useEffect, useState} from "react";
import { useNavigate } from "react-router";
import { createClient } from "@/lib/client";
import axios from "axios";
import { BACKEND_URL } from "../../config";


const supabase = createClient();

export default function Dashboard() {
    const navigate = useNavigate();

    const [user, setUser] = useState<User | null>(null);

    useEffect(() => {
        async function getInfo(){
            const {data, error} = await supabase.auth.getUser()
            if  (data.user) {
                setUser(data.user);
            }
        }
        getInfo();
    }, [])

    useEffect(() => {
        async function getExistingConversation(){
        if (user){
            const {data: {session}} = await supabase.auth.getSession();
            const jwt = session?.access_token;
            if (!jwt) {
                console.error("No JWT token available");
                return;
            }
            //console.log("JWT token:", jwt);
            const response = await axios.get(`${BACKEND_URL}/conversations`,{
                headers: {
                     "Authorization": `Bearer ${jwt}`,
                     "Content-Type": "application/json"
                }
            })
            console.log(response.data);
        }
    }
    getExistingConversation();

    },[user])

    return <div>
            {!user && <button onClick={() =>{
               navigate("/auth");
            }}> Sign in </button>}

            {user && <div>
                {user?.email}
                <button onClick={() => {
                    supabase.auth.signOut();
                    setUser(null);
                }}>Logout</button>
                </div>}
    </div>
}
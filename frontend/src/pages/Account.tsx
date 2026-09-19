import { useNavigate } from "react-router-dom"
import { useAppData } from "../context/AppContext"
import toast from "react-hot-toast"
import { BiLogOut, BiMapPin, BiPackage } from "react-icons/bi"

export const Account = () => {
  const { user, setUser, setIsAuth } = useAppData()
  const firstLetter = user?.name.charAt(0).toLocaleUpperCase()
  const navigate = useNavigate()

  const logoutHandler = () => {
    localStorage.setItem("token", "")
    setUser(null)
    setIsAuth(false)
    navigate("/login", { replace: true })
    toast.success("Logged out successfully")
  }

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-6">
      <div className="mx-auto max-w-md space-y-4">

        {/* Profile card */}
        <div className="rounded-xl bg-white shadow-sm overflow-hidden">
          <div className="flex items-center gap-4 p-5">
            <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-[#E23744] text-xl font-semibold text-white shrink-0">
              {firstLetter}
            </div>
            <div>
              <h2 className="text-lg font-semibold">{user?.name}</h2>
              <p className="text-sm text-gray-500">{user?.email}</p>
            </div>
          </div>
        </div>

        {/* Menu items */}
        <div className="rounded-xl bg-white shadow-sm divide-y">
          <div
            className="flex cursor-pointer items-center gap-4 p-5 hover:bg-gray-50 transition"
            onClick={() => navigate("/orders")}
          >
            <BiPackage className="h-5 w-5 text-[#E23744]" />
            <span className="font-medium">Your Orders</span>
          </div>

          <div
            className="flex cursor-pointer items-center gap-4 p-5 hover:bg-gray-50 transition"
            onClick={() => navigate("/address")}
          >
            <BiMapPin className="h-5 w-5 text-[#E23744]" />
            <span className="font-medium">Addresses</span>
          </div>

          <div
            className="flex cursor-pointer items-center gap-4 p-5 hover:bg-gray-50 transition"
            onClick={logoutHandler}
          >
            <BiLogOut className="h-5 w-5 text-[#E23744]" />
            <span className="font-medium">Logout</span>
          </div>
        </div>

      </div>
    </div>
  )
}

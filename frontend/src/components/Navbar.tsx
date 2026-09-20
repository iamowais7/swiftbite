import { Link, useLocation, useSearchParams } from "react-router-dom";
import { useAppData } from "../context/AppContext"
import { useEffect, useState } from "react";
import {BiSearch,BiMapPin} from "react-icons/bi";
import {CgShoppingCart} from "react-icons/cg";
import {HiOutlineQuestionMarkCircle} from "react-icons/hi2";
import Logo from "./Logo";
import ThemeToggle from "./ThemeToggle";


const Navbar =  () => {
  const {isAuth,city,quantity,user } = useAppData();
  const currentLocation = useLocation();
  const isHomePage = currentLocation.pathname==='/';

  const [searchParams, setSearchParams] = useSearchParams();
  const [search, setSearch] = useState(searchParams.get("search") || "");
  useEffect(()=>{
    const timer = setTimeout(()=>{
      if(search){
        setSearchParams({search})
      }else{
        setSearchParams({})
      }
    },400)
    return () => clearTimeout(timer);
  },[search]);
  return (
    <div className="w-full bg-white shadow-sm dark:bg-gray-900 dark:shadow-none dark:border-b dark:border-gray-800">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
        <Link to={'/'} className="cursor-pointer">
          <Logo />
        </Link>

        <div className="flex items-center gap-4">
          {isAuth && (
            <>
              <Link to={'/help'} className="flex items-center gap-1 font-medium text-gray-600 hover:text-brand dark:text-gray-300" title="Help">
                <HiOutlineQuestionMarkCircle className="h-6 w-6" />
                <span className="hidden sm:inline">Help</span>
              </Link>
              <Link to={'/cart'} className="relative">
              <CgShoppingCart className="h-6 w-6 text-brand"/>
              <span className="absolute -top-2 -right-2 flex h-5 w-5 items-center justify-center rounded-full bg-brand text-xs font-semibold text-white">{quantity}

              </span>
              </Link>
            </>
          )}
          <ThemeToggle />
          {
            isAuth ? (
              <Link to="/account" className="flex items-center gap-2" title="Account">
                {user?.image ? (
                  <img
                    src={user.image}
                    alt={user.name || "Account"}
                    className="h-8 w-8 rounded-full object-cover ring-2 ring-brand/30"
                  />
                ) : (
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-brand/10 text-sm font-bold text-brand">
                    {user?.name?.[0]?.toUpperCase() || "A"}
                  </span>
                )}
              </Link>
            ):(<Link to="/login" className="font-medium text-brand">Login</Link>)
          }
        </div>
      </div>
      {/* search bar */}
      {
        isHomePage && <div className="border-t px-4 py-3 dark:border-gray-800">
          <div className="mx-auto flex max-w-7xl items-center rounded-lg border shadow-sm dark:border-gray-700 dark:bg-gray-800">
            <div className="flex items-center gap-2 px-3 border-r text-gray-700 dark:border-gray-700 dark:text-gray-300">
              <BiMapPin className='h-4 w-4 text-brand'/>
              <span className="text-sm truncate max-w-35">{city}</span>
            </div>
            <div className="flex flex-1 items-center gap-2 px-3">
            <BiSearch className="text-gray-500 text-lg" />
  <input
    type="text"
    placeholder="Search for restaurant"
    value={search}
    onChange={(e) => setSearch(e.target.value)}
    className="w-full text-sm outline-none dark:bg-transparent dark:text-white dark:placeholder-gray-500"
  />
            </div>
          </div>
        </div>
      }
     </div>
  )
}

export default Navbar

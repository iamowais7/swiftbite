import { Link, useLocation, useSearchParams } from "react-router-dom";
import { useAppData } from "../context/AppContext"
import { useEffect, useState } from "react";
import {BiSearch,BiMapPin} from "react-icons/bi";
import {CgShoppingCart} from "react-icons/cg";
import Logo from "./Logo";


const Navbar =  () => {
  const {isAuth,city,quantity } = useAppData();
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
    <div className="w-full bg-white shadow-sm">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
        <Link to={'/'} className="cursor-pointer">
          <Logo />
        </Link>

        <div className="flex items-center gap-4">
          <Link to={'/cart'} className="relative">
          <CgShoppingCart className="h-6 w-6 text-brand"/>
          <span className="absolute -top-2 -right-2 flex h-5 w-5 items-center justify-center rounded-full bg-brand text-xs font-semibold text-white">{quantity}

          </span>
          </Link>
          {
            isAuth ? (<Link to="/account" className="font-medium text-brand">Account</Link>):(<Link to="/login" className="font-medium text-brand">Login</Link>)
          }
        </div>
      </div>
      {/* search bar */}
      {
        isHomePage && <div className="border-t px-4 py-3">
          <div className="mx-auto flex max-w-7xl items-center rounded-lg border shadow-sm">
            <div className="flex items-center gap-2 px-3 border-r text-gray-700">
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
    className="w-full text-sm outline-none"
  />
            </div>
          </div>
        </div>
      }
     </div>
  )
}

export default Navbar
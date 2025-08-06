export const Profile = ({ height = "20px", width = "20px", onClick }) => {
  return (
    <div>
      <svg
        width={width}
        height={height}
        viewBox="0 0 20 20"
        version="1.1"
        xmlns="http://www.w3.org/2000/svg"
        // xmlns:xlink="http://www.w3.org/1999/xlink"
        onClick={onClick}
      >
        <title>profile [#1335]</title>
        <desc>Created with Sketch.</desc>
        <defs></defs>
        <g
          id="Page-1"
          stroke="none"
          stroke-width="0.5"
          fill="none"
          fill-rule="evenodd"
        >
          <g
            id="Dribbble-Light-Preview"
            transform="translate(-420.000000, -2159.000000)"
            fill="#000000"
          >
            <g id="icons" transform="translate(56.000000, 160.000000)">
              <path
                d="M374,2009 C371.794,2009 370,2007.206 370,2005 C370,2002.794 371.794,2001 374,2001 C376.206,2001 378,2002.794 378,2005 C378,2007.206 376.206,2009 374,2009 M377.758,2009.673 C379.124,2008.574 380,2006.89 380,2005 C380,2001.686 377.314,1999 374,1999 C370.686,1999 368,2001.686 368,2005 C368,2006.89 368.876,2008.574 370.242,2009.673 C366.583,2011.048 364,2014.445 364,2019 L366,2019 C366,2014 369.589,2011 374,2011 C378.411,2011 382,2014 382,2019 L384,2019 C384,2014.445 381.417,2011.048 377.758,2009.673"
                id="profile-[#1335]"
              ></path>
            </g>
          </g>
        </g>
      </svg>
    </div>
  );
};

export const Cart = ({ height = "25px", width = "25px" , onClick}) => {
  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      onClick={onClick}
    >
      <path
        d="M6.29977 5H21L19 12H7.37671M20 16H8L6 3H3M9 20C9 20.5523 8.55228 21 8 21C7.44772 21 7 20.5523 7 20C7 19.4477 7.44772 19 8 19C8.55228 19 9 19.4477 9 20ZM20 20C20 20.5523 19.5523 21 19 21C18.4477 21 18 20.5523 18 20C18 19.4477 18.4477 19 19 19C19.5523 19 20 19.4477 20 20Z"
        stroke="#000000"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
    </svg>
  );
};

export const Love = ({ height = "25px", width = "25px" , onClick}) => {
  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 6.35 6.35"
      xmlns="http://www.w3.org/2000/svg"
      onClick={onClick}
    >
      <path
        d="m 2.1835938,0.72070302 c -0.4271174,0 -0.8546461,0.16323989 -1.1796876,0.48828128 -0.65008277,0.6500828 -0.65008277,1.707339 0,2.3574219 l 1.984375,1.9843749 a 0.26460976,0.26460976 0 0 0 0.373047,0 L 5.3457031,3.5664062 c 0.6500828,-0.6500829 0.6500828,-1.7073391 0,-2.3574219 C 4.7473328,0.61061415 3.8291869,0.62768703 3.1757812,1.1308593 2.8770626,0.90036497 2.5432669,0.72070302 2.1835938,0.72070302 Z m 0,0.52539068 c 0.2902341,-1e-7 0.5800571,0.1113071 0.8046874,0.3359374 a 0.26460976,0.26460976 0 0 0 0.373047,0 c 0.4492606,-0.4492607 1.1620671,-0.4492608 1.611328,0 0.4492609,0.4492608 0.4492609,1.1620674 0,1.6113282 L 3.1757812,4.9902344 1.3769531,3.1933593 c -0.44926078,-0.4492608 -0.44926078,-1.1620674 0,-1.6113282 C 1.6015836,1.3574007 1.8933596,1.2460937 2.1835938,1.2460937 Z"
        fill="#00001d"
      />
    </svg>
  );
};


export const Search = ({ height = "25px", width = "25px" }) => {
  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M14.9536 14.9458L21 21M17 10C17 13.866 13.866 17 10 17C6.13401 17 3 13.866 3 10C3 6.13401 6.13401 3 10 3C13.866 3 17 6.13401 17 10Z"
        stroke="#000000"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
    </svg>
  );
};

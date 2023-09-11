import styled from 'styled-components';

export const AdminHeaderStyle = styled.header`
  display: flex;
  box-sizing: border-box;
  padding: 0 20px;
  width: 100%;
  height: 70px;
  background: #434343;
  font-size: 0;
  position: fixed;
  top: 0;
  left: 0;
  z-index: 999;
  border-bottom: 3px solid #e87900;
  justify-content: space-between;
`;
//  border-bottom: 3px solid #f60606;

export const HeaderBranding = styled.div`
  display: flex;
  align-items: center;
`;

export const HeaderTitle = styled.h2`
  color: #fafbfc;
  font-size: 1.2rem;
`;

export const HeaderNavArea = styled.div`
  display: flex;
  vertical-align: middle;
  text-align: center;
  align-items: center;
  height: 70px;
`;

export const HeaderNav = styled.nav`
  display: flex;
  vertical-align: middle;
  text-align: center;
  height: 70px;
`;

export const HeaderNavTitle = styled.h6`
  font-weight: 700;
  font-size: 0.9rem;
  color: #8d8e8e;
  text-transform: uppercase;
  display: inline-block;
  vertical-align: middle;
  padding: 26px 20px 0;
  height: 70px;
`;

export const HeaderNavList = styled.ul`
  white-space: nowrap;
  display: inline-block;
  vertical-align: middle;
`;

export const HeaderNavItem = styled.li`
  display: inline-block;
  vertical-align: top;
  font-size: 0.9rem;
  color: #fff;
  text-transform: uppercase;

  a {
    display: block;
    padding: 26px 20px 0;
    height: 70px;
    box-sizing: border-box;

    &.active {
      color: #f5a623;
      background: #565656;
      cursor: default;
      text-decoration: none;
      border-bottom: 3px solid rgb(31, 166, 123);
    }
  }
`;

export const HeaderRight = styled.div`
  display: flex;
  align-items: center;
`;

export const HeaderUserBar = styled.div`
  color: #fafbfc;
  font-size: 14px;
  font-weight: 300;
  margin-right: 14px;
  margin-left: 20px;
`;

export const HeaderUsername = styled.span`
  font-weight: 700;
  color: #fafbfc;
`;

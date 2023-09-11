import { useEffect } from 'react';
import { LOBBY_URL } from '../../constants';

export default function RedirectToLobby() {
  useEffect(() => {
    window.location.href = LOBBY_URL;
  }, []);

  return null;
}

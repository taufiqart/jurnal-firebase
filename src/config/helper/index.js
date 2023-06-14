import {onValue, ref} from 'firebase/database';
import {getItemFor} from '../DATA/storageHelper';
import {FIREBASE} from '../FIREBASE';

/*
function menecek data user di local storage jika ada 
berarti sudah login dan jika belum akan di arahkan ke halaman onboarding 
*/
export const checkUser = async ({setUser, setUserProfile, navigation}) => {
  // mengambil data user dari local storage
  const userStorage = await getItemFor('user');
  if (userStorage) {
    setUser && setUser(JSON.parse(userStorage));
    if (setUserProfile) {
      /*
      mengambil data userProfile dari local storage 
      jika data userProfile di local storage kosong maka akan mengambil data dari database
      */
      const userProfileStorage = await getItemFor('userProfile');
      userProfileStorage
        ? setUserProfile(JSON.parse(userProfileStorage))
        : onValue(
            ref(FIREBASE, 'users/' + JSON.parse(userStorage).uid),
            snapshot => {
              if (snapshot.exists()) {
                setUserProfile(snapshot.val());
              } else {
                setUserProfile({});
              }
            },
          );
    }
  } else {
    navigation && navigation.navigate('Onboarding');
  }
};

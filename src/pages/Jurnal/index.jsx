import {
  View,
  Text,
  StatusBar,
  Dimensions,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import React, {useEffect, useState} from 'react';
import {SafeAreaView} from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';
import {FontAwesomeIcon} from '@fortawesome/react-native-fontawesome';
import {faArrowLeft} from '@fortawesome/free-solid-svg-icons';
import tw from 'twrnc';
import SmallCard from '../../components/SmallCard';
import {FIREBASE} from '../../config/FIREBASE/index';
import {onValue, ref} from 'firebase/database';
import {checkUser} from '../../config/helper';
import {Paragraph} from 'react-native-paper';
import {faPiedPiper} from '@fortawesome/free-brands-svg-icons';
import {useIsFocused} from '@react-navigation/native';
import Spinner from 'react-native-loading-spinner-overlay/lib';

export default function Jurnal({navigation}) {
  const windowWidth = Dimensions.get('window').width;
  const windowHeight = Dimensions.get('window').height;

  let [scrollViewHeight, setScrollViewHeight] = useState(windowHeight);
  const [hariIni, setHariIni] = useState(true);
  const [jurnal, setJurnal] = useState(true);
  const [user, setUser] = useState({});
  const [historyJurnal, setHistoryJurnal] = useState();
  const [lastInput, setLastInput] = useState();
  const [userProfile, setUserProfile] = useState();
  const [users, setUsers] = useState();
  const [loading, setLoading] = useState(false);

  const isFocused = useIsFocused();

  useEffect(() => {
    checkUser({setUser, setUserProfile, navigation}).catch(error => {
      console.log(error);
    });
  }, [loading]);

  const getUsers = () => {
    onValue(
      ref(FIREBASE, 'users'),
      snapshot => {
        if (snapshot.exists()) {
          setUsers(snapshot.val());
        }
      },
      {onlyOnce: true},
    );
  };

  // mendapatkan data jurnal
  const getJurnal = () => {
    onValue(ref(FIREBASE, `jurnal`), snapshot => {
      if (snapshot.exists()) {
        let data = snapshot.val();
        // menambahkan data users ke setiap data history
        users &&
          Object.keys(data).map(key => {
            data[key]['user'] = users[data[key].userUid];
          });
        // end
        // jika sebagai siswa maka filter data hanya menampilkan miliknya sendiri
        if (userProfile?.role == 'siswa') {
          let datas = {};
          Object.keys(data).map(key => {
            if (data[key].userUid == user?.uid) {
              datas[key] = data[key];
            }
          });
          setHistoryJurnal(Object.keys(datas).length > 0 ? datas : null);
        } else {
          setHistoryJurnal(data);
        }
        // end
      }
    });
  };
  // end

  // menampilkan loading spinner
  useEffect(() => {
    setLoading(true);
    // menghilangkan loading spinner setelah 1000 milidetik
    setTimeout(() => {
      setLoading(false);
    }, 1000);
    // end
  }, [isFocused]);
  // end

  /*
    useeffect akan dijalankan pada pertama kali halaman di buka 
    dan jika ada perubahan data pada array
  */
  useEffect(() => {
    // memanggil function getusers jika tidak ada data users dan jika tidak sebagai siswa
    !users && userProfile?.role != 'siswa' && getUsers();
    // end
    // memanggil function getJurnal jika ada data user
    user && getJurnal();
    // end
  }, [loading, users, userProfile, user]);
  // end

  // useeffect akan dijalankan terus menerus karna tidak ada array
  useEffect(() => {
    if (user) {
      if (historyJurnal) {
        // mendapatkan data jurnal terbaru dari user
        let last =
          historyJurnal[
            Object.keys(historyJurnal)[Object.keys(historyJurnal).length - 1]
          ];

        if (last.userUid == user?.uid) {
          setLastInput(last);
        }
        // end

        /* 
          jika ada data terbaru dan jika tanggal merupakan hari ini 
          maka akan menampilkan text anda sudah mengisi jurnal
          jika tidak maka akan menampilkan button absensi
          */
        if (lastInput) {
          let tanggal = Date.now();
          setHariIni(
            new Date(lastInput?.tanggal).getDay() == new Date(tanggal).getDay(),
          );
          if (hariIni) {
            setJurnal(false);
          } else {
            setJurnal(true);
          }
        } else {
          setJurnal(true);
        }
        // end
      }
    }
  });
  // end
  return (
    <LinearGradient
      colors={['#6170FF', '#AEDDFF']}
      className="h-full w-[600px]"
      useAngle={true}
      angle={90}>
      <StatusBar barStyle="dark-content" />
      <View style={{width: windowWidth}}>
        <SafeAreaView className="bg-white h-24 w-full rounded-b-3xl overflow-hidden">
          <View className="flex px-5 h-full  flex-row items-center">
            {/* button kembali */}
            <TouchableOpacity
              onPress={() => {
                navigation.goBack();
              }}
              className="p-2 rounded-full absolute mx-5 z-20 bg-slate-100">
              <FontAwesomeIcon
                icon={faArrowLeft}
                size={20}
                style={tw`text-slate-700`}
              />
            </TouchableOpacity>
            {/* end */}
            <View
              style={{width: windowWidth}}
              className="absolute flex justify-center items-center">
              <View className="px-7 rounded-full bg-slate-100 py-1">
                <Text className="text-slate-700 text-lg ">Jurnal</Text>
              </View>
            </View>
          </View>
        </SafeAreaView>
        {/* jika sebagai siswa dan jika belum mengisi jurnal maka menampilkan button isi jurnal */}
        {userProfile?.role == 'siswa' &&
          (jurnal ? (
            <View className="px-5  w-full my-12">
              {/* button redirect ke halaman isi jurnal */}
              <TouchableOpacity
                onPress={() => {
                  navigation.navigate('IsiJurnal');
                }}
                className={`w-full bg-white h-20 rounded-2xl flex justify-center items-center overflow-hidden shadow-xl shadow-black flex-row`}>
                <LinearGradient
                  colors={['#FAF5FF', '#F3E8FF']}
                  useAngle={true}
                  angle={90}
                  className="w-full h-full px-5 flex justify-center items-center flex-row">
                  <FontAwesomeIcon
                    icon={faPiedPiper}
                    style={tw`text-blue-600 mr-4 `}
                    size={24}
                  />

                  <Text className={`text-blue-600 text-2xl font-semibold`}>
                    Isi Jurnal
                  </Text>
                </LinearGradient>
              </TouchableOpacity>
              {/* end */}
            </View>
          ) : (
            <View className="px-5  w-full my-10">
              <View
                className={`w-full bg-gray-200 px-5 h-20 rounded-2xl flex justify-center items-center shadow-xl shadow-black`}>
                <Text className={`text-slate-500 text-xl font-semibold`}>
                  Anda sudah mengisi jurnal
                </Text>
                <Paragraph className="text-lg text-slate-500 leading-5">
                  Isi lagi besok
                </Paragraph>
              </View>
            </View>
          ))}
        {/* end */}
        <View
          className={`w-full h-full overflow-hidden ${
            userProfile?.role != 'siswa' && 'mt-10'
          } rounded-t-3xl bg-red-400 `}
          onLayout={event => {
            const {x, y, width, height} = event.nativeEvent.layout;
            setScrollViewHeight(windowHeight - y + StatusBar.currentHeight);
          }}
          style={{height: scrollViewHeight}}>
          <LinearGradient
            colors={['white', '#F2F3F7']}
            style={{height: scrollViewHeight}}
            className="w-full">
            <ScrollView
              style={{height: scrollViewHeight}}
              className="w-full p-5">
              {/* jika tidak loading dan jika history jurnal ada maka tampilkan list history jurnal */}
              {!loading ? (
                historyJurnal ? (
                  // looping jurnal
                  Object.keys(historyJurnal)
                    .reverse()
                    .map(key => {
                      return (
                        <TouchableOpacity
                          activeOpacity={0.8}
                          key={key}
                          // button redirect ke datail jurnal dengan data historyurnal dan user profile
                          onPress={() => {
                            navigation.navigate('DetailJurnal', {
                              data: historyJurnal[key],
                              userProfile: userProfile,
                            });
                          }}
                          // end
                        >
                          <SmallCard status={'disetujui'} icon={faPiedPiper}>
                            {/* menampilkan data tanggal */}
                            <Text className="text-slate-600">
                              {new Date(
                                historyJurnal[key].tanggal,
                              ).toLocaleString()}
                            </Text>
                            {/* end */}
                            {/* menampilkan nama user jika tidak sebagai siswa */}
                            {userProfile?.role != 'siswa' && (
                              <Text className="text-slate-600">
                                {historyJurnal[key]?.user?.fullName}
                              </Text>
                            )}
                            {/* end */}
                            {/* menampilkan data judul */}
                            <Text className="text-slate-600">
                              {historyJurnal[key].judul}
                            </Text>
                            {/* end */}
                          </SmallCard>
                        </TouchableOpacity>
                      );
                    })
                ) : (
                  // end
                  <View className="h-full justify-center w-full items-center">
                    <Text className="text-slate-700 text-center text-lg">
                      Belum ada Jurnal
                    </Text>
                  </View>
                )
              ) : (
                <Spinner visible={loading}></Spinner>
              )}
              {/* end */}
              <View className="h-10"></View>
            </ScrollView>
          </LinearGradient>
        </View>
      </View>
    </LinearGradient>
  );
}

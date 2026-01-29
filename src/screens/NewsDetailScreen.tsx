import React from 'react';
import { View, Text, StyleSheet, Image, ScrollView, TouchableOpacity, SafeAreaView } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import { COLORS } from '../styles/theme';
import { ArrowLeft, Calendar, Share2 } from 'lucide-react-native';

type Props = NativeStackScreenProps<RootStackParamList, 'NewsDetail'>;

const NewsDetailScreen = ({ route, navigation }: Props) => {
    const { newsItem } = route.params;

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <ArrowLeft color={COLORS.black} size={24} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>News Article</Text>
                <TouchableOpacity style={styles.shareButton}>
                    <Share2 color={COLORS.black} size={24} />
                </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
                <Image source={{ uri: newsItem.imageUrl }} style={styles.image} />

                <View style={styles.contentContainer}>
                    <View style={styles.dateContainer}>
                        <Calendar size={14} color={COLORS.darkGray} />
                        <Text style={styles.dateText}>{newsItem.date}</Text>
                    </View>

                    <Text style={styles.title}>{newsItem.title}</Text>

                    <View style={styles.divider} />

                    <Text style={styles.content}>{newsItem.content}</Text>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.white,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingVertical: 15,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.lightGray,
    },
    backButton: {
        padding: 5,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: COLORS.black,
    },
    shareButton: {
        padding: 5,
    },
    image: {
        width: '100%',
        height: 250,
        resizeMode: 'cover',
    },
    contentContainer: {
        padding: 24,
    },
    dateContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    dateText: {
        fontSize: 14,
        color: COLORS.darkGray,
        marginLeft: 6,
    },
    title: {
        fontSize: 24,
        fontWeight: '800',
        color: COLORS.black,
        lineHeight: 32,
        marginBottom: 20,
    },
    divider: {
        height: 1,
        backgroundColor: COLORS.lightGray,
        marginBottom: 20,
    },
    content: {
        fontSize: 16,
        color: COLORS.black,
        lineHeight: 26,
        textAlign: 'justify',
    },
});

export default NewsDetailScreen;

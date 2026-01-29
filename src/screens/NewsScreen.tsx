import React, { useState, useCallback, useMemo } from 'react';
import { View, Text, StyleSheet, FlatList, Image, TouchableOpacity, SafeAreaView, RefreshControl, Platform, TextInput } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList, NewsItem } from '../navigation/types';
import Header from '../components/Header';
import { COLORS, SPACING } from '../styles/theme';
import { ChevronRight, Search, X } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';

type Props = NativeStackScreenProps<RootStackParamList, 'News'>;

const DUMMY_NEWS: NewsItem[] = [
    {
        id: '1',
        title: 'Post-Quantum End-to-End Encryption Now Live',
        summary: 'Our latest update brings quantum-resistant algorithms to every conversation, ensuring your data remains secure even against future threats.',
        content: 'We are thrilled to announce the successful deployment of our proprietary Post-Quantum Cryptography (PQC) engine. This milestone represents years of research into lattice-based cryptography, designed specifically to withstand the computing power of future quantum systems. While quantum computers don\'t yet pose a widespread threat, "harvest now, decrypt later" attacks mean your data needs protection today. Every message you send is now double-wrapped in both standard AES-256 and our new quantum-resistant layer.',
        date: 'Jan 21, 2026',
        imageUrl: 'https://images.unsplash.com/photo-1633265486064-086b219458ec?auto=format&fit=crop&q=80&w=1000',
    },
    {
        id: '2',
        title: 'Blockchain Digital Passport: The Future of Identity',
        summary: 'A revolutionary approach to identity verification that puts you in control of your personal data without centralized authorities.',
        content: 'The Passport App is introducing a decentralized identity protocol built on top of a private, high-performance blockchain. This feature allows users to verify their identities for third-party services without ever handing over their primary documents. By using Zero-Knowledge Proofs (ZKP), you can prove your age, nationality, or accreditation without revealing anything else. This is the cornerstone of our "Privacy First" philosophy, moving away from vulnerable centralized databases toward a truly sovereign digital identity.',
        date: 'Jan 20, 2026',
        imageUrl: 'https://images.unsplash.com/photo-1639762681485-074b7f938ba0?auto=format&fit=crop&q=80&w=1000',
    },
    {
        id: '3',
        title: 'Secure Sync: Cross-Device Privacy without Compromise',
        summary: 'Sync your encrypted keys across all your devices using our new mesh networking protocol, no cloud storage required.',
        content: 'One of the biggest challenges in E2EE messaging has always been secure multi-device synchronization. Our new Secure Sync feature solves this by using a peer-to-peer mesh protocol. Instead of uploading your private keys to a cloud server where they could potentially be compromised, your devices communicate directly with each other to establish a secure handshake. This ensures that your chat history and identity remain consistent across your phone, tablet, and desktop while maintaining the highest level of security.',
        date: 'Jan 19, 2026',
        imageUrl: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc48?auto=format&fit=crop&q=80&w=1000',
    },
];

const NewsCard = React.memo(({ item, onPress }: { item: NewsItem; onPress: () => void }) => {
    const { t } = useTranslation();
    return (
        <TouchableOpacity
            style={styles.card}
            onPress={onPress}
            activeOpacity={0.7}
        >
            <Image source={{ uri: item.imageUrl }} style={styles.cardImage} />
            <View style={styles.cardContent}>
                <Text style={styles.cardDate}>{item.date}</Text>
                <Text style={styles.cardTitle} numberOfLines={2}>{item.title}</Text>
                <Text style={styles.cardSummary} numberOfLines={2}>{item.summary}</Text>
                <View style={styles.readMoreContainer}>
                    <Text style={styles.readMoreText}>{t('news.readMore')}</Text>
                    <ChevronRight size={16} color={COLORS.black} />
                </View>
            </View>
        </TouchableOpacity>
    );
});

const NewsScreen = ({ navigation }: Props) => {
    const [refreshing, setRefreshing] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const { t } = useTranslation();

    const filteredNews = useMemo(() => {
        if (!searchQuery.trim()) return DUMMY_NEWS;
        const query = searchQuery.toLowerCase();
        return DUMMY_NEWS.filter(news =>
            news.title.toLowerCase().includes(query) ||
            news.summary.toLowerCase().includes(query)
        );
    }, [searchQuery]);

    const onRefresh = useCallback(() => {
        setRefreshing(true);
        setTimeout(() => {
            setRefreshing(false);
        }, 2000);
    }, []);

    const handleNewsPress = useCallback((item: NewsItem) => {
        navigation.navigate('NewsDetail', { newsItem: item });
    }, [navigation]);

    const renderItem = useCallback(({ item }: { item: NewsItem }) => (
        <NewsCard item={item} onPress={() => handleNewsPress(item)} />
    ), [handleNewsPress]);

    const clearSearch = () => setSearchQuery('');

    return (
        <SafeAreaView style={styles.container}>
            <Header title={t('news.title')} />

            <View style={styles.searchContainer}>
                <Search size={20} color={COLORS.darkGray} />
                <TextInput
                    style={styles.searchInput}
                    placeholder={t('news.searchPlaceholder') || 'Cari berita...'}
                    placeholderTextColor={COLORS.darkGray}
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                />
                {searchQuery.length > 0 && (
                    <TouchableOpacity onPress={clearSearch}>
                        <X size={20} color={COLORS.darkGray} />
                    </TouchableOpacity>
                )}
            </View>

            <FlatList
                data={filteredNews}
                renderItem={renderItem}
                keyExtractor={item => item.id}
                contentContainerStyle={styles.listContainer}
                showsVerticalScrollIndicator={false}
                initialNumToRender={5}
                maxToRenderPerBatch={5}
                windowSize={3}
                removeClippedSubviews={Platform.OS === 'android'}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                        colors={[COLORS.black]}
                        tintColor={COLORS.black}
                    />
                }
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <Text style={styles.emptyText}>{t('news.noResults') || 'Tidak ada berita ditemukan'}</Text>
                    </View>
                }
            />
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.white,
    },
    listContainer: {
        padding: 20,
        paddingTop: 10,
    },
    card: {
        backgroundColor: COLORS.white,
        borderRadius: 16,
        marginBottom: 24,
        overflow: 'hidden',
        borderWidth: 1,
        borderBottomWidth: 4,
        borderColor: COLORS.lightGray,
    },
    cardImage: {
        width: '100%',
        height: 180,
        resizeMode: 'cover',
    },
    cardContent: {
        padding: 16,
    },
    cardDate: {
        fontSize: 12,
        color: COLORS.darkGray,
        marginBottom: 4,
        fontWeight: '600',
    },
    cardTitle: {
        fontSize: 18,
        fontWeight: '800',
        color: COLORS.black,
        marginBottom: 8,
    },
    cardSummary: {
        fontSize: 14,
        color: COLORS.darkGray,
        lineHeight: 20,
        marginBottom: 12,
    },
    readMoreContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    readMoreText: {
        fontSize: 14,
        fontWeight: '700',
        color: COLORS.black,
        marginRight: 4,
    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.gray,
        marginHorizontal: 20,
        marginVertical: 10,
        paddingHorizontal: SPACING.md,
        borderRadius: 12,
        height: 45,
    },
    searchInput: {
        flex: 1,
        fontSize: 16,
        color: COLORS.black,
        marginLeft: SPACING.sm,
        paddingVertical: 0,
    },
    emptyContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingTop: 60,
    },
    emptyText: {
        fontSize: 16,
        color: COLORS.darkGray,
    },
});

export default NewsScreen;

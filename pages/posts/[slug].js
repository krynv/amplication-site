import DocumentHead from '../../components/Common/DocumentHead';
import client from '../../services';
import helpers from '../../helpers';
import {gql} from '@apollo/client';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import Thumbnail from '../../components/Posts/PostCard/Tumbnail';
import Link from 'next/link';
import Author from '../../components/Posts/PostCard/Author';
import Tags from '../../components/Posts/PostCard/Tags';
import Title from '../../components/Posts/PostCard/Title';
import showdown from 'showdown';
import PostCard from '../../components/Posts/PostCard';
import { Pagination } from 'swiper';
import { Swiper, SwiperSlide } from 'swiper/react';
import Sidebar from '../../components/Sidebar';
import 'swiper/css';
import 'swiper/css/pagination';
import PropTypes from 'prop-types';

const Post = ({posts, post}) => {
  return (
    <>
      <DocumentHead
        pageTitle='some'
        pageDescription='some'
      />

      <div className='page min-h-screen flex flex-col justify-start justify-items-stretch overflow-hidden pt-[65px] laptop:pt-0 bg-purple-dark'>
        <Header/>

        <div className='w-full p-container laptop:max-w-container-desktop laptop:m-container-desktop laptop:p-container-desktop mt-16 laptop:mt-12'>
          <nav>
            <ul className='flex justify-start items-center flex-wrap'>
              <li className='text-white inline-block mr-1'>
                <Link href={process.env.NEXT_PUBLIC_SITE}>
                  <a className='text-white font-poppins font-medium text-sm'>
                    Home
                  </a>
                </Link> /
              </li>
              <li className='text-white inline-block mr-1'>
                <Link href='/'>
                  <a className='text-white font-poppins font-medium text-sm'>
                    Blog
                  </a>
                </Link> /
              </li>
              <li className='text-turquoise inline-block'>
                <span className='text-turquoise font-poppins font-medium text-sm'>
                  {post.title}
                </span>
              </li>
            </ul>
          </nav>
        </div>

        <main className='flex flex-col flex-wrap laptop:flex-row justify-between w-full bg-dark-black-100 font-poppins overflow-hidden p-container laptop:max-w-container-desktop laptop:m-container-desktop laptop:p-container-desktop py-6 laptop:pt-12 laptop:pb-10 gap-8'>
          <div className='w-full laptop:max-w-[881px] flex-1 order-1'>
            { post &&
              <>
                <Title level={1} className='text-lg font-medium text-white text-[32px] leading-[48px] mb-8' text={ post.title } />
                <Tags list={ post.tags }/>
                <Author
                  className={ 'mt-8' }
                  avatar={ post.author?.profileImage }
                  name={ post.author?.firstName + ' ' + post.author?.lastName }
                  date={ post.createdAt }
                  large={ true }
                />
                <Thumbnail
                  className={ 'my-8 rounded-2xl aspect-thumbnail-hero laptop:aspect-thumbnail-hero' }
                  src={ helpers.isValidUrl( post.featuredImage ) ? post.featuredImage : null }
                  alt={ post.title }
                />
                <div
                  className='text-base text-white leading-6 mt-2'
                  dangerouslySetInnerHTML={{
                    __html: new showdown.Converter({
                      tables: true,
                    }).makeHtml( post.content )
                  }}
                >

                </div>
              </>
            }
          </div>

          <aside className='w-full laptop:w-[425px] order-9 laptop:order-2'>
            <Sidebar />
          </aside>

          { Array.isArray(posts) && posts.length &&
            (
              <>
                <div className='w-full order-3'>
                  <Title level={2} className='text-2xl laptop:text-[32px] leading-9 laptop:leading-[48px] font-semibold text-white mb-[-8px] laptop:mb-[-16px] mt-[60px]'>
                    Related Posts<span className='text-[#53DBEE]'>.</span>
                  </Title>
                </div>
                <div className='w-full pb-6 order-4'>
                  <Swiper
                    className='flex flex-col-reverse'
                    loop={false}
                    spaceBetween={24}
                    slidesPerView={3}
                    breakpoints={{
                      320: {
                        slidesPerView: 1,
                      },
                      640: {
                        slidesPerView: 2,
                      },
                      991: {
                        slidesPerView: 3,
                      },
                    }}
                    modules={[Pagination]}
                    pagination={{
                      clickable: true,
                      clickableClass: `swiper-pagination-clickable !relative pt-4`,
                      bulletClass: `swiper-pagination-bullet !bg-white`,
                      bulletActiveClass: `swiper-pagination-bullet-active relative top-[1px] !bg-secondary-turquoise !w-2.5 !h-2.5`,
                    }}
                  >
                    {
                      posts.map((post, i) => {
                        return (
                          <SwiperSlide key={ post.id } virtualIndex={i}>
                            <PostCard data={ post } key={ post.id } />
                          </SwiperSlide>
                        )
                      })
                    }
                  </Swiper>
                </div>
              </>
            )
          }
        </main>

        <Footer />
      </div>
    </>
  )
}

export const getServerSideProps = async (context) => {
  const postID = helpers.getPostID(context.query ? context.query.slug : '');
  try {
    const {data} = await client.query({
      query: gql`
        query {
          post(where: {id: "${postID}"}) {
            id
            title
            content
            featuredImage
            tags {
              id
              name
            }
            author {
              id
              firstName
              lastName
              profileImage
            }
            createdAt
          }
        }
      `
    });

    const tags = data.post.tags && data.post.tags.length ? `, tags: {some: {id: {in: ["${data.post.tags.map((tag) => {
      return tag.id
    }).join('" ,"')}"]}}}` : '';
    let posts = await client.query({
      query: gql`
        query {
          posts(take: 3, orderBy: {createdAt: Desc}, where: {id: {not: "${data.post.id}"} ${tags}}) {
            id
            title
            content
            featuredImage
            tags {
              id
              name
            }
            author {
              id
              firstName
              lastName
              profileImage
            }
            createdAt
          }
        }
      `
    });
    return {
      props: {
        posts: posts?.data?.posts,
        post: data?.post
      },
    };
  } catch (e) {
    console.error(e)
  }

  return {
    props: {
      posts: null,
      post: null
    },
  }
};

Post.propTypes = {
  post: PropTypes.object.isRequired,
  posts: PropTypes.array,
};

Post.defaultProps = {
  posts: [],
};

export default Post;